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

    // Create pending record first
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

    console.log('Created pending record:', pendingRecord.id);

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
        
        const bananaTTSUrl = 'http://localhost:7860/api/generate_speech';
        const requestData = {
          text: text,
          model_name: modelName,
          emotion: emotion,
          temperature: 1.0,
          top_p: 0.95,
          top_k: 50
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
          console.error('BananaTTS API error:', bananaTTSResponse.status, await bananaTTSResponse.text());
          return;
        }

        const bananaTTSData = await bananaTTSResponse.json();

        if (!bananaTTSData.success || !bananaTTSData.audio_data) {
          console.error('BananaTTS generation failed or no audio data:', bananaTTSData);
          return;
        }

        console.log('Audio generated successfully, received base64 data');

        // Convert base64 audio data to buffer properly
        const audioBase64 = bananaTTSData.audio_data;
        
        // Use proper base64 decoding for binary data
        const binaryString = atob(audioBase64);
        const audioBuffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          audioBuffer[i] = binaryString.charCodeAt(i);
        }
        
        // Determine file extension from audio format or default to wav
        const audioFormat = bananaTTSData.audio_format || 'wav';
        const contentType = `audio/${audioFormat}`;
        
        console.log(`Processing audio: format=${audioFormat}, size=${audioBuffer.byteLength} bytes`);
        
        // Upload the generated audio to storage with proper folder structure
        const generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.${audioFormat}`;
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('voices')
          .upload(generatedFileName, audioBuffer, {
            contentType: contentType,
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return;
        }

        console.log('Audio uploaded successfully:', {
          path: uploadData.path,
          id: uploadData.id,
          fullPath: uploadData.fullPath,
          contentType: contentType,
          fileSize: audioBuffer.byteLength
        });

        // Get public URL for the generated audio
        const { data: generatedUrlData } = supabaseClient.storage
          .from('voices')
          .getPublicUrl(generatedFileName);

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
          console.error('Failed to update voice clone record:', finalError);
          // Clean up uploaded file
          await supabaseClient.storage
            .from('voices')
            .remove([generatedFileName]);
          // Mark record as failed
          await supabaseClient
            .from('generated_voice_clones')
            .update({ status: 'Failed' })
            .eq('job_id', jobId);
          return;
        }

        console.log('Background voice generation completed for job:', jobId);

      } catch (error) {
        console.error('Background task error:', error);
        // Mark record as failed
        await supabaseClient
          .from('generated_voice_clones')
          .update({ status: 'Failed' })
          .eq('job_id', jobId);
      }
    };

    // Start background task using waitUntil
    EdgeRuntime.waitUntil(backgroundTask());

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
    console.error('Error in voice-generate function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});