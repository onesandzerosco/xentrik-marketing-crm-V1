
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice settings mapping
const VOICE_SETTINGS = {
  normal: { stability: 0.5, similarity_boost: 0.5 },
  tired: { stability: 0.3, similarity_boost: 0.4 },
  sexy: { stability: 0.6, similarity_boost: 0.7 },
  excited: { stability: 0.2, similarity_boost: 0.8 },
  whisper: { stability: 0.8, similarity_boost: 0.3 },
  casual: { stability: 0.5, similarity_boost: 0.6 },
  seductive: { stability: 0.7, similarity_boost: 0.8 },
};

// Safe base64 encoding function to prevent stack overflow
function safeBase64Encode(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunkSize = 8192; // Process in chunks to avoid stack overflow
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
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
  
  // Use safe base64 encoding to prevent stack overflow
  const base64Audio = safeBase64Encode(audioArrayBuffer);
  return `data:audio/mp3;base64,${base64Audio}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { voiceId, message, tone, ambience } = await req.json();

    console.log('Voice generation request:', { voiceId, message: message?.substring(0, 50) + '...', tone, ambience });

    if (!voiceId || !message || !tone) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: voiceId, message, and tone' }),
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

    // Generate voice using ElevenLabs
    const audioBase64 = await generateVoiceWithElevenLabs(voiceId, message, tone);

    // Calculate cost
    const characterCount = message.length;
    const costPerCharacter = 0.0002;
    const totalCost = characterCount * costPerCharacter;

    console.log('Voice generated successfully:', { 
      voiceId, 
      characterCount, 
      cost: totalCost 
    });

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        voiceId: voiceId,
        characterCount: characterCount,
        cost: totalCost
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
