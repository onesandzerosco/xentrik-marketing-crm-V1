
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Voice settings mapping similar to your Telegram bot
const VOICE_SETTINGS = {
  normal: { stability: 0.5, similarity_boost: 0.5 },
  tired: { stability: 0.3, similarity_boost: 0.4 },
  sexy: { stability: 0.6, similarity_boost: 0.7 },
  excited: { stability: 0.2, similarity_boost: 0.8 },
  whisper: { stability: 0.8, similarity_boost: 0.3 },
  casual: { stability: 0.5, similarity_boost: 0.6 },
  seductive: { stability: 0.7, similarity_boost: 0.8 },
};

async function getCreatorVoiceId(creatorId: string) {
  const { data: creator, error } = await supabase
    .from('creators')
    .select('model_profile')
    .eq('id', creatorId)
    .single();

  if (error || !creator) {
    console.error('Error fetching creator:', error);
    return null;
  }

  // Check if the creator has ElevenLabs voice ID in their model profile
  const voiceId = creator.model_profile?.elevenlabs_voice_id;
  
  if (!voiceId) {
    // Return a default voice ID if none is configured
    return "9BWtsMINqrJLrRacOk9x"; // Aria voice as default
  }
  
  return voiceId;
}

async function generateVoiceWithElevenLabs(voiceId: string, text: string, tone: string) {
  const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
  
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const voiceSettings = VOICE_SETTINGS[tone as keyof typeof VOICE_SETTINGS] || VOICE_SETTINGS.normal;
  
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const requestBody = {
    text: text,
    model_id: "eleven_multilingual_v2",
    voice_settings: voiceSettings
  };

  console.log('Calling ElevenLabs API with:', { voiceId, text: text.substring(0, 50) + '...', tone });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ElevenLabs API error:', response.status, errorText);
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const audioArrayBuffer = await response.arrayBuffer();
  const audioBytes = new Uint8Array(audioArrayBuffer);
  
  // Convert to base64
  const base64Audio = btoa(String.fromCharCode(...audioBytes));
  return `data:audio/mp3;base64,${base64Audio}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { creatorId, message, tone, ambience } = await req.json();

    console.log('Voice generation request:', { creatorId, message: message?.substring(0, 50) + '...', tone, ambience });

    if (!creatorId || !message || !tone) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: creatorId, message, and tone' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (message.length > 2500) {
      return new Response(
        JSON.stringify({ error: 'Message too long. Maximum 2500 characters allowed.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the voice ID for this creator
    const voiceId = await getCreatorVoiceId(creatorId);
    
    if (!voiceId) {
      return new Response(
        JSON.stringify({ error: 'Voice ID not found for this creator' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate voice using ElevenLabs
    const audioBase64 = await generateVoiceWithElevenLabs(voiceId, message, tone);

    // Record the usage (similar to your Telegram bot's record_request function)
    const { error: insertError } = await supabase
      .from('voice_generation_requests')
      .insert({
        creator_id: creatorId,
        message: message,
        tone: tone,
        ambience: ambience,
        voice_id: voiceId,
        character_count: message.length,
        cost_per_character: 0.0002, // Same as your Telegram bot
        total_cost: message.length * 0.0002,
        generated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error recording voice generation request:', insertError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        voiceId: voiceId,
        characterCount: message.length,
        cost: message.length * 0.0002
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Voice generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error during voice generation' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
