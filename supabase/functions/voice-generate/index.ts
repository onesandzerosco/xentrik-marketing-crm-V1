import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for server operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify the user using anon client
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, modelName, emotion } = await req.json();
    
    console.log('=== VOICE GENERATION REQUEST ===');
    console.log('User ID:', user.id);
    console.log('Text:', text);
    console.log('Model:', modelName);
    console.log('Emotion:', emotion);

    if (!text || !modelName || !emotion) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, modelName, emotion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a job ID for tracking
    const jobId = `voice-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Job ID created:', jobId);

    // Step 1: Create pending record with empty bucket_key
    console.log('=== STEP 1: CREATE PENDING RECORD ===');
    const { data: pendingRecord, error: insertError } = await supabaseClient
      .from('generated_voice_clones')
      .insert({
        model_name: modelName,
        emotion: emotion,
        generated_text: text,
        generated_by: user.id,
        job_id: jobId,
        status: 'Pending',
        bucket_key: '',
        audio_url: ''
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create pending record:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create pending record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Pending record created:', pendingRecord.id);

    // Step 2-4: Background processing
    const backgroundTask = async () => {
      try {
        console.log('=== STEP 2: GENERATE SPEECH VIA API ===');
        console.log(`Starting generation for job: ${jobId}`);
        
        const bananaTTSUrl = 'https://2e850c82df32.ngrok-free.app/api/generate_speech';
        const requestData = {
          text: text,
          model_name: modelName,
          emotion: emotion,
          temperature: 1.0,
          top_p: 0.95,
          top_k: 50
        };

        console.log('API Request:', JSON.stringify(requestData, null, 2));

        const bananaTTSResponse = await fetch(bananaTTSUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(requestData)
        });

        console.log('API Response Status:', bananaTTSResponse.status);
        console.log('API Response Headers:', Object.fromEntries(bananaTTSResponse.headers));

        if (!bananaTTSResponse.ok) {
          const errorText = await bananaTTSResponse.text();
          console.error('❌ API ERROR:', errorText);
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        const responseText = await bananaTTSResponse.text();
        console.log('Raw response length:', responseText.length);
        
        let bananaTTSData;
        try {
          bananaTTSData = JSON.parse(responseText);
          console.log('Parsed response keys:', Object.keys(bananaTTSData));
          console.log('Full response structure:', JSON.stringify(bananaTTSData, null, 2));
        } catch (parseError) {
          console.error('❌ JSON PARSE ERROR:', parseError);
          console.error('Raw response preview:', responseText.substring(0, 500));
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        // Check for success and extract data from API response
        if (!bananaTTSData.success) {
          console.error('❌ API returned success: false');
          console.error('Error:', bananaTTSData.error || 'Unknown error');
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('=== STEP 3: PROCESS API RESPONSE ===');
        
        // Extract data from successful API response
        const apiGeneratedText = bananaTTSData.generated_text || text;
        const bucketKey = bananaTTSData.bucket_key;
        const requestId = bananaTTSData.request_id;
        
        console.log('API Generated Text:', apiGeneratedText);
        console.log('Bucket Key from API:', bucketKey);
        console.log('Request ID:', requestId);

        // Check if API successfully uploaded to storage
        if (!bucketKey) {
          console.error('❌ NO BUCKET KEY - API upload failed');
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('✅ API upload successful, bucket key received');

        console.log('=== STEP 4: UPDATE RECORD WITH API DATA ===');

        // Get public URL for the generated audio using the bucket key from API
        const { data: generatedUrlData } = supabaseClient.storage
          .from('generated_voices')
          .getPublicUrl(bucketKey);

        console.log('Public URL:', generatedUrlData.publicUrl);

        // Update the pending record with the API data
        const { data: jobRecord, error: finalError } = await supabaseClient
          .from('generated_voice_clones')
          .update({
            bucket_key: bucketKey,
            generated_text: apiGeneratedText,
            audio_url: generatedUrlData.publicUrl,
            status: 'Success'
          })
          .eq('job_id', jobId)
          .select()
          .single();

        if (finalError) {
          console.error('❌ DATABASE UPDATE ERROR:', finalError);
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('=== ✅ SUCCESS: WORKFLOW COMPLETE ===');
        console.log('Final record ID:', jobRecord.id);
        console.log('Bucket key:', jobRecord.bucket_key);
        console.log('Audio URL:', jobRecord.audio_url);
        console.log('Status:', jobRecord.status);

      } catch (error) {
        console.error('=== ❌ BACKGROUND TASK ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Mark record as failed
        try {
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
        } catch (updateError) {
          console.error('Failed to update record as failed:', updateError);
        }
      }
    };

    // Use proper background processing for long-running tasks
    console.log('Starting background task for job:', jobId);
    
    // Start the background task and handle it properly
    const taskPromise = backgroundTask();
    
    // Use EdgeRuntime.waitUntil to ensure the task completes even if the response is sent
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(taskPromise);
    } else {
      // Fallback for development
      taskPromise.catch((error) => {
        console.error('Background task failed:', error);
      });
    }

    // Return immediate response with job ID and record ID
    return new Response(
      JSON.stringify({ 
        message: 'Voice generation started',
        jobId: jobId,
        recordId: pendingRecord.id,
        status: 'processing'
      }),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== ❌ MAIN FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});