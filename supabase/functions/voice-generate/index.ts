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
    
    console.log('Voice generation request received:', { text, modelName, emotion });

    if (!text || !modelName || !emotion) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, modelName, emotion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a job ID for tracking
    const jobId = `voice-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Starting voice generation job:', jobId);

    // Start background processing
    const backgroundTask = async () => {
      try {
        console.log('Starting background voice generation for job:', jobId);

        // Get the voice source from the database
        const { data: voiceSource, error: dbError } = await supabaseClient
          .from('voice_sources')
          .select('bucket_key')
          .eq('model_name', modelName)
          .eq('emotion', emotion)
          .maybeSingle();

        if (dbError || !voiceSource) {
          console.error('Database error or no voice source:', dbError);
          return;
        }

        // Call BananaTTS API for voice generation
        console.log('Calling BananaTTS API for voice generation');
        
        const bananaTTSUrl = 'https://983efae1c5de.ngrok-free.app/api/generate_speech';
        const requestData = {
          text: text,
          model_name: modelName,
          emotion: emotion,
          reference_audio: null,
          reference_text: null,
          max_completion_tokens: 1024,
          temperature: 1.0,
          top_p: 0.95,
          top_k: 50,
          system_prompt: "",
          stop_strings: ["<|end_of_text|>", "<|eot_id|>"],
          ras_win_len: 7,
          ras_win_max_num_repeat: 2
        };

        console.log('Sending request to BananaTTS:', { 
          url: bananaTTSUrl,
          modelName, 
          emotion, 
          textLength: text.length 
        });

        const bananaTTSResponse = await fetch(bananaTTSUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://rdzwpiokpyssqhnfiqrt.supabase.co'
          },
          body: JSON.stringify(requestData)
        });

        if (!bananaTTSResponse.ok) {
          console.error('BananaTTS API error:', bananaTTSResponse.status);
          return;
        }

        const bananaTTSData = await bananaTTSResponse.json();

        if (!bananaTTSData.success || !bananaTTSData.download_url) {
          console.error('BananaTTS generation failed:', bananaTTSData);
          return;
        }

        console.log(`Audio generated successfully. Download URL: ${bananaTTSData.download_url}`);

        // Download the audio file from the BananaTTS API
        const audioDownloadUrl = `https://983efae1c5de.ngrok-free.app${bananaTTSData.download_url}`;
        console.log(`Downloading audio from: ${audioDownloadUrl}`);
        
        const audioDownloadResponse = await fetch(audioDownloadUrl);
        
        if (!audioDownloadResponse.ok) {
          console.error('Failed to download audio:', audioDownloadResponse.status);
          return;
        }

        const audioBuffer = await audioDownloadResponse.arrayBuffer();
        console.log(`Downloaded audio file, size: ${audioBuffer.byteLength} bytes`);
        
        // Upload the generated audio to storage
        const generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.wav`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('voices')
          .upload(generatedFileName, new Uint8Array(audioBuffer), {
            contentType: 'audio/wav',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return;
        }

        console.log('Audio generated and uploaded successfully:', uploadData);

        // Get public URL for the generated audio
        const { data: generatedUrlData } = supabaseClient.storage
          .from('voices')
          .getPublicUrl(generatedFileName);

        // Only NOW create the database record with the complete data
        const { data: jobRecord, error: finalError } = await supabaseClient
          .from('generated_voice_clones')
          .insert({
            bucket_key: generatedFileName,
            model_name: modelName,
            emotion: emotion,
            generated_text: bananaTTSData.generated_text || text,
            generated_by: user.id,
            job_id: jobId,
            audio_url: generatedUrlData.publicUrl
          })
          .select()
          .single();

        if (finalError) {
          console.error('Failed to save completed voice clone:', finalError);
          // Clean up uploaded file
          await supabaseClient.storage
            .from('voices')
            .remove([generatedFileName]);
          return;
        }

        console.log('Background voice generation completed for job:', jobId);

      } catch (error) {
        console.error('Background task error:', error);
      }
    };

    // Start background task using waitUntil
    EdgeRuntime.waitUntil(backgroundTask());

    // Return immediate response with job ID
    return new Response(
      JSON.stringify({ 
        message: 'Voice generation started',
        jobId: jobId,
        status: 'processing'
      }),
      { 
        status: 202, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in voice-generate function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});