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

        // Check for success and extract audio data
        if (!bananaTTSData.success) {
          console.error('❌ API returned success: false');
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        let audioData = bananaTTSData.audio_data;
        
        if (!audioData) {
          console.error('❌ NO AUDIO DATA FOUND');
          console.error('Available keys:', Object.keys(bananaTTSData));
          console.error('Response structure:', JSON.stringify(bananaTTSData, null, 2));
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('✅ Audio data received, length:', audioData.length);

        console.log('=== STEP 3: UPLOAD AUDIO TO STORAGE ===');
        
        // Process base64 audio data
        let audioBase64 = audioData;
        
        // Clean up base64 string
        audioBase64 = audioBase64.replace(/\s/g, '');
        while (audioBase64.length % 4) {
          audioBase64 += '=';
        }
        
        // Convert base64 to Uint8Array
        let audioBuffer: Uint8Array;
        try {
          audioBuffer = Uint8Array.from(atob(audioBase64), (c) => c.charCodeAt(0));
          console.log('Audio buffer size:', audioBuffer.byteLength, 'bytes');
        } catch (decodeError) {
          console.error('❌ BASE64 DECODE ERROR:', decodeError);
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }
        
        const audioFormat = bananaTTSData.audio_format || 'wav';
        const contentType = `audio/${audioFormat}`;
        const generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.${audioFormat}`;
        
        console.log('Upload path:', generatedFileName);
        console.log('Content type:', contentType);
        
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('generated_voices')
          .upload(generatedFileName, audioBuffer, {
            contentType: contentType,
            upsert: false
          });

        if (uploadError) {
          console.error('❌ UPLOAD ERROR:', uploadError);
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('✅ Upload successful:', uploadData.path);

        console.log('=== STEP 4: UPDATE RECORD WITH BUCKET_KEY ===');

        // Get public URL for the generated audio
        const { data: generatedUrlData } = supabaseClient.storage
          .from('generated_voices')
          .getPublicUrl(generatedFileName);

        console.log('Public URL:', generatedUrlData.publicUrl);

        // Update the pending record with the complete data
        const { data: jobRecord, error: finalError } = await supabaseClient
          .from('generated_voice_clones')
          .update({
            bucket_key: generatedFileName,
            generated_text: text,
            audio_url: generatedUrlData.publicUrl,
            status: 'Success'
          })
          .eq('job_id', jobId)
          .select()
          .single();

        if (finalError) {
          console.error('❌ DATABASE UPDATE ERROR:', finalError);
          // Clean up uploaded file
          await supabaseClient.storage
            .from('generated_voices')
            .remove([generatedFileName]);
          // Mark record as failed
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