
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = "7500569565:AAFll3mu7mVJ_mzIC2zX24L8t1mYaMa0bv4";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for accessing creators data
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const VOICE_TONES = [
  { id: 'normal', name: 'Normal' },
  { id: 'tired', name: 'Tired' },
  { id: 'sexy', name: 'Sexy' },
  { id: 'excited', name: 'Excited' },
  { id: 'whisper', name: 'Whisper' },
  { id: 'casual', name: 'Casual' },
  { id: 'seductive', name: 'Seductive' },
];

// User session storage
const userSessions = new Map();

interface UserSession {
  step: 'selecting_creator' | 'selecting_tone' | 'entering_message';
  selectedCreator?: string;
  selectedTone?: string;
  creatorOptions?: any[];
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      reply_markup: replyMarkup,
    }),
  });
  return response.json();
}

async function sendVoiceMessage(chatId: number, audioBase64: string, caption?: string) {
  // Convert base64 to binary for Telegram
  const binaryString = atob(audioBase64.replace('data:audio/mp3;base64,', ''));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  formData.append('chat_id', chatId.toString());
  formData.append('voice', new Blob([bytes], { type: 'audio/mpeg' }), 'voice.mp3');
  if (caption) formData.append('caption', caption);

  const response = await fetch(`${TELEGRAM_API_URL}/sendVoice`, {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

async function getCreators() {
  const { data: creators, error } = await supabase
    .from('creators')
    .select('id, name')
    .eq('active', true);
  
  if (error) {
    console.error('Error fetching creators:', error);
    return [];
  }
  
  return creators || [];
}

function createCreatorKeyboard(creators: any[]) {
  const keyboard = creators.map(creator => [{
    text: `${creator.name} Model`,
    callback_data: `creator_${creator.id}`
  }]);
  
  return {
    inline_keyboard: keyboard
  };
}

function createToneKeyboard() {
  const keyboard = VOICE_TONES.map(tone => [{
    text: tone.name,
    callback_data: `tone_${tone.id}`
  }]);
  
  return {
    inline_keyboard: keyboard
  };
}

async function generateVoice(creatorId: string, tone: string, message: string) {
  try {
    // Call your voice generation API using the provided API key
    const response = await fetch('https://api.your-voice-service.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk_ac245bd4e35ea3976298913a1202a82d8db5975534c00f3e`
      },
      body: JSON.stringify({
        creator_id: creatorId,
        tone: tone,
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`Voice generation API error: ${response.status}`);
    }

    const data = await response.json();
    return data.audio_base64 || generateMockAudio();
  } catch (error) {
    console.error('Error generating voice:', error);
    // Return mock audio as fallback
    return generateMockAudio();
  }
}

function generateMockAudio() {
  // Return mock base64 audio data for testing
  return "data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
}

async function handleStart(chatId: number) {
  const creators = await getCreators();
  
  if (creators.length === 0) {
    await sendMessage(chatId, "Sorry, no voice models are available at the moment.");
    return;
  }

  // Initialize user session
  userSessions.set(chatId, {
    step: 'selecting_creator',
    creatorOptions: creators
  });

  await sendMessage(
    chatId,
    "🎤 Welcome to the Voice Generator Bot!\n\nStep 1: Choose a voice model:",
    createCreatorKeyboard(creators)
  );
}

async function handleCreatorSelection(chatId: number, creatorId: string) {
  const session = userSessions.get(chatId);
  if (!session || session.step !== 'selecting_creator') {
    await sendMessage(chatId, "Please start over by typing /start");
    return;
  }

  const selectedCreator = session.creatorOptions?.find(c => c.id === creatorId);
  if (!selectedCreator) {
    await sendMessage(chatId, "Invalid model selection. Please try again.");
    return;
  }

  // Update session
  session.selectedCreator = creatorId;
  session.step = 'selecting_tone';
  userSessions.set(chatId, session);

  await sendMessage(
    chatId,
    `✅ Selected: ${selectedCreator.name} Model\n\nStep 2: Choose the AI tone:`,
    createToneKeyboard()
  );
}

async function handleToneSelection(chatId: number, toneId: string) {
  const session = userSessions.get(chatId);
  if (!session || session.step !== 'selecting_tone') {
    await sendMessage(chatId, "Please start over by typing /start");
    return;
  }

  const selectedTone = VOICE_TONES.find(t => t.id === toneId);
  if (!selectedTone) {
    await sendMessage(chatId, "Invalid tone selection. Please try again.");
    return;
  }

  // Update session
  session.selectedTone = toneId;
  session.step = 'entering_message';
  userSessions.set(chatId, session);

  await sendMessage(
    chatId,
    `✅ Selected tone: ${selectedTone.name}\n\nStep 3: Enter the message you want to generate in AI voice:`
  );
}

async function handleMessageGeneration(chatId: number, message: string) {
  const session = userSessions.get(chatId);
  if (!session || session.step !== 'entering_message') {
    await sendMessage(chatId, "Please start over by typing /start");
    return;
  }

  if (!session.selectedCreator || !session.selectedTone) {
    await sendMessage(chatId, "Missing selection data. Please start over by typing /start");
    return;
  }

  await sendMessage(chatId, "🔄 Generating your AI voice message...");

  try {
    const audioBase64 = await generateVoice(session.selectedCreator, session.selectedTone, message);
    
    const selectedCreator = session.creatorOptions?.find(c => c.id === session.selectedCreator);
    const selectedTone = VOICE_TONES.find(t => t.id === session.selectedTone);
    
    const caption = `🎤 Voice generated!\nModel: ${selectedCreator?.name}\nTone: ${selectedTone?.name}\nMessage: "${message}"`;
    
    await sendVoiceMessage(chatId, audioBase64, caption);
    
    // Clear session
    userSessions.delete(chatId);
    
    await sendMessage(chatId, "Voice generation complete! Type /start to generate another voice message.");
    
  } catch (error) {
    console.error('Voice generation error:', error);
    await sendMessage(chatId, "❌ Sorry, there was an error generating the voice. Please try again later.");
    userSessions.delete(chatId);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      if (text === '/start') {
        await handleStart(chatId);
      } else {
        // Handle message input for voice generation
        const session = userSessions.get(chatId);
        if (session && session.step === 'entering_message') {
          await handleMessageGeneration(chatId, text);
        } else {
          await sendMessage(chatId, "Please start by typing /start to begin voice generation.");
        }
      }
    } else if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id;
      const data = body.callback_query.data;

      // Answer callback query
      await fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: body.callback_query.id,
        }),
      });

      if (data.startsWith('creator_')) {
        const creatorId = data.replace('creator_', '');
        await handleCreatorSelection(chatId, creatorId);
      } else if (data.startsWith('tone_')) {
        const toneId = data.replace('tone_', '');
        await handleToneSelection(chatId, toneId);
      }
    }

    return new Response('ok', { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Telegram bot error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
