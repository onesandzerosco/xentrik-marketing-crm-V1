import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set the auth token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, roles')
      .eq('id', user.id)
      .single();

    console.log('Profile check:', { profile, profileError, userId: user.id });

    if (profileError || !profile) {
      console.log('Profile not found or error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Admin access required - profile not found' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isAdmin = profile.role === 'Admin' || profile.roles?.includes('Admin');
    console.log('Admin check:', { role: profile.role, roles: profile.roles, isAdmin });

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: `Admin access required - current role: ${profile.role}, roles: ${JSON.stringify(profile.roles)}` }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const modelName = formData.get('modelName') as string;
    const emotion = formData.get('emotion') as string;

    if (!file || !modelName || !emotion) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, modelName, emotion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate emotion
    const validEmotions = ['sexual', 'angry', 'excited', 'sweet', 'sad', 'conversational'];
    if (!validEmotions.includes(emotion)) {
      return new Response(
        JSON.stringify({ error: 'Invalid emotion. Must be one of: ' + validEmotions.join(', ') }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'wav';
    const uniqueId = crypto.randomUUID();
    const bucketKey = `voices/${modelName}/${emotion}/${uniqueId}.${fileExtension}`;

    // Upload file to storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voices')
      .upload(bucketKey, fileBuffer, {
        contentType: file.type || 'audio/wav',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert record into voice_sources table
    const { data: voiceSource, error: dbError } = await supabase
      .from('voice_sources')
      .insert({
        model_name: modelName,
        emotion: emotion,
        bucket_key: bucketKey
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('voices').remove([bucketKey]);
      return new Response(
        JSON.stringify({ error: 'Failed to save voice source' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Voice uploaded successfully',
        voiceSource: voiceSource
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in voice-upload function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});