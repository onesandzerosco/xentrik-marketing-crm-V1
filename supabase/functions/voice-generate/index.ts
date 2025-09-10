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

    const { text, modelName, emotion, jobId } = await req.json();
    
    console.log('=== VOICE GENERATION REQUEST ===');
    console.log('User ID:', user.id);
    console.log('Text:', text);
    console.log('Model:', modelName);
    console.log('Emotion:', emotion);
    console.log('Job ID:', jobId);

    if (!text || !modelName || !emotion || !jobId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, modelName, emotion, jobId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the API directly and return response
    try {
      console.log('=== CALLING EXTERNAL API ===');
      console.log(`Calling API for job: ${jobId}`);
      
      const bananaTTSUrl = 'https://d08bb18fed5a.ngrok-free.app/api/generate_speech';
      const requestData = {
        text: text,
        model_name: modelName,
        emotion: emotion,
        job_id: jobId,
        temperature: 1.0,
        top_p: 0.95
      };

      console.log('API Request:', JSON.stringify(requestData, null, 2));

      const bananaTTSResponse = await fetch(bananaTTSUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestData)
      });

      console.log('API Response Status:', bananaTTSResponse.status);
      console.log('API Response Headers:', Object.fromEntries(bananaTTSResponse.headers));

      if (!bananaTTSResponse.ok) {
        const errorText = await bananaTTSResponse.text();
        console.error('❌ API ERROR:', errorText);
        return new Response(
          JSON.stringify({ error: 'API call failed', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const responseText = await bananaTTSResponse.text();
      console.log('Raw response length:', responseText.length);
      
      let bananaTTSData;
      try {
        bananaTTSData = JSON.parse(responseText);
        console.log('Parsed response keys:', Object.keys(bananaTTSData));
        console.log('Full response structure:', JSON.stringify(bananaTTSData, null, 2));
      } catch (parseError) {
        console.error('❌ JSON PARSE ERROR:', parseError);
        console.error('Raw response preview:', responseText.substring(0, 500));
        return new Response(
          JSON.stringify({ error: 'Failed to parse API response', details: parseError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check for success and extract data from API response
      if (!bananaTTSData.success) {
        console.error('❌ API returned success: false');
        console.error('Error:', bananaTTSData.error || 'Unknown error');
        return new Response(
          JSON.stringify({ error: 'API generation failed', details: bananaTTSData.error }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('=== ✅ API SUCCESS ===');
      console.log('Generated Text:', bananaTTSData.generated_text);
      console.log('Bucket Key:', bananaTTSData.bucket_key);
      console.log('Request ID:', bananaTTSData.request_id);

      // Return the API response directly
      return new Response(
        JSON.stringify({ 
          success: true,
          data: bananaTTSData,
          message: 'Voice generation completed successfully'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (error) {
      console.error('=== ❌ API CALL ERROR ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      return new Response(
        JSON.stringify({ error: 'Voice generation failed', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('=== ❌ MAIN FUNCTION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});