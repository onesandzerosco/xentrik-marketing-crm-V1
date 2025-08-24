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

    if (!text || !modelName || !emotion) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, modelName, emotion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating voice for:', { modelName, emotion, textLength: text.length });

    // Get the voice source from the database
    const { data: voiceSource, error: dbError } = await supabaseClient
      .from('voice_sources')
      .select('bucket_key')
      .eq('model_name', modelName)
      .eq('emotion', emotion)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch voice source', details: dbError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!voiceSource) {
      return new Response(
        JSON.stringify({ error: `No voice source found for model "${modelName}" with emotion "${emotion}"` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the audio file from storage
    const { data: audioFile, error: storageError } = await supabaseClient.storage
      .from('voices')
      .download(voiceSource.bucket_key);

    if (storageError) {
      console.error('Storage error:', storageError);
      return new Response(
        JSON.stringify({ error: 'Failed to download voice source file', details: storageError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use the HiggsAudio voice cloning system
    console.log('Using HiggsAudio voice cloning system');
    
    // Get the reference audio file URL for the HiggsAudio service
    const { data: urlData } = supabaseClient.storage
      .from('voices')
      .getPublicUrl(voiceSource.bucket_key);
    
    const referenceAudioUrl = urlData.publicUrl;
    console.log('Reference audio URL:', referenceAudioUrl);

    // Call the HiggsAudio service
    // Note: The HiggsAudio service should be running on localhost:7860 or another configured endpoint
    const higgsAudioEndpoint = Deno.env.get('HIGGS_AUDIO_ENDPOINT') || 'http://localhost:7860';
    let generatedFileName = '';
    
    try {
      console.log('Calling HiggsAudio service at:', higgsAudioEndpoint);
      
      // Prepare the request for the HiggsAudio service
      const formData = new FormData();
      formData.append('system_prompt', ''); // Empty for voice cloning
      formData.append('input_text', text);
      formData.append('voice_preset', 'EMPTY'); // Use custom reference
      formData.append('reference_audio', referenceAudioUrl);
      formData.append('reference_text', ''); // We don't have reference text
      formData.append('max_completion_tokens', '1024');
      formData.append('temperature', '1.0');
      formData.append('top_p', '0.95');
      formData.append('top_k', '50');
      formData.append('ras_win_len', '7');
      formData.append('ras_win_max_num_repeat', '3');
      
      const response = await fetch(`${higgsAudioEndpoint}/api/generate_speech`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HiggsAudio service error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result || !result.audio_path) {
        throw new Error('No audio generated by HiggsAudio service');
      }

      // The HiggsAudio service returns a path to the generated audio file
      // We need to read this file and upload it to our storage
      const audioResponse = await fetch(`${higgsAudioEndpoint}${result.audio_path}`);
      if (!audioResponse.ok) {
        throw new Error('Failed to download generated audio from HiggsAudio service');
      }

      const audioBuffer = await audioResponse.arrayBuffer();
      
      // Upload the generated audio to storage
      generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.wav`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('voices')
        .upload(generatedFileName, audioBuffer, {
          contentType: 'audio/wav',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return new Response(
          JSON.stringify({ error: 'Failed to save generated audio', details: uploadError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Generated audio uploaded successfully:', uploadData);

    } catch (higgsError) {
      console.error('HiggsAudio service error:', higgsError);
      return new Response(
        JSON.stringify({ error: 'HiggsAudio voice generation failed', details: higgsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the generated audio
    const { data: generatedUrlData } = supabaseClient.storage
      .from('voices')
      .getPublicUrl(generatedFileName);

    console.log('Generated audio saved to:', generatedFileName);

    return new Response(
      JSON.stringify({ 
        message: 'Voice generated successfully',
        audioUrl: generatedUrlData.publicUrl,
        fileName: generatedFileName
      }),
      { 
        status: 200, 
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