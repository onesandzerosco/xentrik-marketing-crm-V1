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

    console.log('Sending request to BananaTTS:', { modelName, emotion, textLength: text.length });

    const bananaTTSResponse = await fetch(bananaTTSUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!bananaTTSResponse.ok) {
      console.error('BananaTTS API error:', bananaTTSResponse.status, bananaTTSResponse.statusText);
      return new Response(
        JSON.stringify({ error: `BananaTTS API failed: ${bananaTTSResponse.status} ${bananaTTSResponse.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bananaTTSData = await bananaTTSResponse.json();

    if (!bananaTTSData.success) {
      console.error('BananaTTS generation failed:', bananaTTSData.error || 'Unknown error');
      return new Response(
        JSON.stringify({ error: `Voice generation failed: ${bananaTTSData.error || 'Unknown error'}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!bananaTTSData.download_url) {
      console.error('No download URL provided by BananaTTS:', bananaTTSData);
      return new Response(
        JSON.stringify({ error: 'No download URL received from voice generation service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Audio generated successfully. Download URL: ${bananaTTSData.download_url}`);

    // Download the audio file from the BananaTTS API
    const audioDownloadUrl = `https://983efae1c5de.ngrok-free.app${bananaTTSData.download_url}`;
    console.log(`Downloading audio from: ${audioDownloadUrl}`);
    
    const audioDownloadResponse = await fetch(audioDownloadUrl);
    
    if (!audioDownloadResponse.ok) {
      console.error('Failed to download audio:', audioDownloadResponse.status, audioDownloadResponse.statusText);
      return new Response(
        JSON.stringify({ error: `Failed to download generated audio: ${audioDownloadResponse.status} ${audioDownloadResponse.statusText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'Failed to save generated audio', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Audio generated and uploaded successfully:', uploadData);

    // Save the generated voice clone data to the database
    const { data: voiceCloneData, error: dbInsertError } = await supabaseClient
      .from('generated_voice_clones')
      .insert({
        bucket_key: generatedFileName,
        model_name: modelName,
        emotion: emotion,
        generated_text: text,
        generated_by: user.id
      })
      .select()
      .single();

    if (dbInsertError) {
      console.error('Database insert error:', dbInsertError);
      // Still return success since the audio was generated and uploaded
      console.warn('Failed to save voice clone metadata to database, but audio generation succeeded');
    } else {
      console.log('Voice clone metadata saved to database:', voiceCloneData);
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
        generatedPath: generatedFileName,
        generatedText: bananaTTSData.generated_text,
        voiceCloneId: voiceCloneData?.id
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