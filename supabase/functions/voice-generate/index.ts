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

    const { text, modelName, emotion, jobId } = await req.json();
    
    console.log('=== VOICE GENERATION REQUEST ===');
    console.log('User ID:', user.id);
    console.log('Text:', text);
    console.log('Model:', modelName);
    console.log('Emotion:', emotion);
    console.log('Job ID:', jobId);

    if (!text || !modelName || !emotion || !jobId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, modelName, emotion, jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start background task for long-running API call
    console.log('=== STARTING BACKGROUND VOICE GENERATION ===');
    console.log(`Starting background job: ${jobId}`);
    
    const bananaTTSUrl = 'https://d08bb18fed5a.ngrok-free.app/api/generate_speech';
    const requestData = {
      text: text,
      model_name: modelName,
      emotion: emotion,
      job_id: jobId,
      temperature: 1.0,
      top_p: 0.95
    };

    console.log('API Request:', JSON.stringify(requestData, null, 2));

    const backgroundTask = async () => {
      try {
        console.log('🔄 Background task: Calling external API...');
        
        const bananaTTSResponse = await fetch(bananaTTSUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(requestData)
        });

        console.log('🔄 Background task: API Response Status:', bananaTTSResponse.status);

        if (!bananaTTSResponse.ok) {
          const errorText = await bananaTTSResponse.text();
          console.error('❌ Background task: API ERROR:', errorText);
          
          // Update record with error status
          await supabaseClient
            .from('generated_voice_clones')
            .update({ 
              status: 'Failed',
              error_message: `API Error: ${bananaTTSResponse.status} - ${errorText}`
            })
            .eq('job_id', jobId);
          
          return;
        }

        const responseText = await bananaTTSResponse.text();
        console.log('🔄 Background task: Raw response length:', responseText.length);
        
        let bananaTTSData;
        try {
          bananaTTSData = JSON.parse(responseText);
          console.log('🔄 Background task: Parsed response keys:', Object.keys(bananaTTSData));
        } catch (parseError) {
          console.error('❌ Background task: JSON PARSE ERROR:', parseError);
          
          // Update record with error status
          await supabaseClient
            .from('generated_voice_clones')
            .update({ 
              status: 'Failed',
              error_message: `JSON Parse Error: ${parseError.message}`
            })
            .eq('job_id', jobId);
          
          return;
        }

        // Check for success and extract data from API response
        if (!bananaTTSData.success) {
          console.error('❌ Background task: API returned success: false');
          console.error('Error:', bananaTTSData.error || 'Unknown error');
          
          // Update record with error status
          await supabaseClient
            .from('generated_voice_clones')
            .update({ 
              status: 'Failed',
              error_message: `API generation failed: ${bananaTTSData.error || 'Unknown error'}`
            })
            .eq('job_id', jobId);
          
          return;
        }

        console.log('✅ Background task: API SUCCESS');
        console.log('Generated Text:', bananaTTSData.generated_text);
        console.log('Bucket Key:', bananaTTSData.bucket_key);
        console.log('Request ID:', bananaTTSData.request_id);

        // The external API should have already updated the database with success status and bucket_key
        // But let's verify and update if needed
        const { data: existingRecord } = await supabaseClient
          .from('generated_voice_clones')
          .select('status, bucket_key')
          .eq('job_id', jobId)
          .single();

        if (existingRecord && (!existingRecord.bucket_key || existingRecord.status !== 'Completed')) {
          console.log('🔄 Updating record with bucket_key and status...');
          await supabaseClient
            .from('generated_voice_clones')
            .update({ 
              status: 'Completed',
              bucket_key: bananaTTSData.bucket_key,
              audio_url: `https://rdzwpiokpyssqhnfiqrt.supabase.co/storage/v1/object/public/voices/${bananaTTSData.bucket_key}`
            })
            .eq('job_id', jobId);
        }

        console.log('✅ Background task completed successfully');
        
      } catch (error) {
        console.error('❌ Background task error:', error);
        
        // Update record with error status
        await supabaseClient
          .from('generated_voice_clones')
          .update({ 
            status: 'Failed',
            error_message: `Background task error: ${error.message}`
          })
          .eq('job_id', jobId);
      }
    };

    // Start background task using EdgeRuntime.waitUntil
    EdgeRuntime.waitUntil(backgroundTask());

    // Return immediate response
    return new Response(
      JSON.stringify({ 
        success: true,
        jobId: jobId,
        message: 'Voice generation started in background. This may take 2-3 minutes.',
        status: 'processing'
      }),
      { 
        status: 200, 
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