import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

const AIRTABLE_BASE_ID = 'appc8VhZZXOJBjJbC';
const VOICES_TABLE = 'Voices';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const airtableApiKey = Deno.env.get('AIRTABLE_API_KEY');
    if (!airtableApiKey) {
      return new Response(
        JSON.stringify({ error: 'AIRTABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch voices from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${VOICES_TABLE}`,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Group voices by Client Name and organize the data
    const voicesByClient: Record<string, any[]> = {};
    
    data.records.forEach((record: any) => {
      const fields = record.fields;
      const clientName = fields['Client Name'];
      
      if (clientName) {
        if (!voicesByClient[clientName]) {
          voicesByClient[clientName] = [];
        }
        voicesByClient[clientName].push({
          tone: fields.Tone || 'Default',
          elevenId: fields.Eleven_ID,
          apiKey: fields.API_Key,
          accent: fields.Accent || '',
          costPerChar: fields.Cost_Per_Character || 0.0002
        });
      }
    });

    console.log('Fetched voices from Airtable:', Object.keys(voicesByClient));

    return new Response(
      JSON.stringify({ voicesByClient }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in airtable-voices function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});