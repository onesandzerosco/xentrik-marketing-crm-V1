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

    // Test BananaTTS API availability first
    const bananaTTSBaseUrl = 'https://03c396de4237.ngrok-free.app';
    console.log('Testing BananaTTS API availability...');
    
    try {
      const healthResponse = await fetch(`${bananaTTSBaseUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(10000) // 10 second timeout for health check
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Health check failed: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('BananaTTS API health check passed:', healthData);
    } catch (healthError) {
      console.error('BananaTTS API health check failed:', healthError);
      return new Response(
        JSON.stringify({ error: 'BananaTTS API is not available. Please check the service status.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call BananaTTS API for voice generation
    console.log('Calling BananaTTS API for voice generation');
    
    const bananaTTSUrl = `${bananaTTSBaseUrl}/api/generate_speech`;
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

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('BananaTTS request timeout after 120 seconds');
      controller.abort();
    }, 120000); // 2 minute timeout

    let bananaTTSResponse;
    try {
      bananaTTSResponse = await fetch(bananaTTSUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(requestData)
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('BananaTTS fetch error:', fetchError);
      throw new Error(`BananaTTS API connection failed: ${fetchError.message}`);
    }

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

    if (!bananaTTSData.audio || !Array.isArray(bananaTTSData.audio) || bananaTTSData.audio.length < 2) {
      console.error('Invalid audio data from BananaTTS:', bananaTTSData.audio);
      return new Response(
        JSON.stringify({ error: 'Invalid audio data received from voice generation service' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [sampleRate, audioArray] = bananaTTSData.audio;
    console.log(`Audio generated successfully: ${sampleRate}Hz, ${audioArray.length} samples`);

    // Convert BananaTTS audio to WAV format
    const createWavFromBananaTTS = (audioArray: number[], sampleRate: number): Uint8Array => {
      const audioData = new Int16Array(audioArray);
      const length = audioData.length;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true); // fmt chunk size
      view.setUint16(20, 1, true);  // audio format (PCM)
      view.setUint16(22, 1, true);  // number of channels
      view.setUint32(24, sampleRate, true); // sample rate
      view.setUint32(28, sampleRate * 2, true); // byte rate
      view.setUint16(32, 2, true);  // block align
      view.setUint16(34, 16, true); // bits per sample
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Write audio data
      for (let i = 0; i < length; i++) {
        view.setInt16(44 + i * 2, audioData[i], true);
      }
      
      return new Uint8Array(buffer);
    };

    const audioBuffer = createWavFromBananaTTS(audioArray, sampleRate);
    
    // Upload the generated audio to storage
    const generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.wav`;
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

    console.log('BananaTTS audio generated and uploaded successfully:', uploadData);

    // Get public URL for the generated audio
    const { data: generatedUrlData } = supabaseClient.storage
      .from('voices')
      .getPublicUrl(generatedFileName);

    console.log('Generated audio saved to:', generatedFileName);

    return new Response(
      JSON.stringify({ 
        message: 'Voice generated successfully using BananaTTS',
        audioUrl: generatedUrlData.publicUrl,
        generatedPath: generatedFileName,
        generatedText: bananaTTSData.generated_text
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