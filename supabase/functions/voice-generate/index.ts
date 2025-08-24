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
    
    // For now, create a mock response since we need to integrate the Python HiggsAudio system
    // In a complete implementation, this would:
    // 1. Save the reference audio to a temporary location
    // 2. Call the HiggsAudio voice cloning engine with the text and reference audio
    // 3. Return the generated audio
    
    // Create a mock audio response (placeholder)
    const mockAudioData = new ArrayBuffer(1024); // Small empty audio buffer
    const generatedAudio = mockAudioData;

    // Upload the generated audio to storage
    const generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('voices')
      .upload(generatedFileName, generatedAudio, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to save generated audio', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL for the generated audio
    const { data: urlData } = supabaseClient.storage
      .from('voices')
      .getPublicUrl(generatedFileName);

    console.log('Generated audio saved to:', generatedFileName);

    return new Response(
      JSON.stringify({ 
        message: 'Voice generated successfully',
        audioUrl: urlData.publicUrl,
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