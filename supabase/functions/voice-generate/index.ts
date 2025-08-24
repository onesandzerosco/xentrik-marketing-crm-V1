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

    // Use the HiggsAudio voice cloning system directly from your code
    console.log('Using HiggsAudio voice cloning system');
    
    // Convert audio file to base64 for Python script
    const audioArrayBuffer = await audioFile.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));
    
    // Create Python script that uses your HiggsAudio model
    const pythonScript = `
import sys
import json
import base64
import tempfile
import os
import numpy as np
import torch
import wave
from io import BytesIO

# Add the project path to use your higgs_audio module
project_path = "/opt/project"
sys.path.insert(0, f"{project_path}/src/services/voice-clone")

try:
    from higgs_audio.serve.serve_engine import HiggsAudioServeEngine
    from higgs_audio.dataset.chatml_dataset import ChatMLSample, AudioContent
    
    def generate_voice(text, audio_base64, model_name, emotion):
        # Decode the reference audio
        audio_bytes = base64.b64decode(audio_base64)
        
        # Create temporary file for reference audio
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio_path = temp_audio.name
        
        try:
            # Initialize the HiggsAudio engine with a default model path
            # You'll need to configure this with your actual model path
            engine = HiggsAudioServeEngine(
                model_name_or_path=model_name,
                audio_tokenizer_name_or_path=model_name,
                device="cpu"
            )
            
            # Create ChatML sample with reference audio
            chat_sample = ChatMLSample(
                messages=[
                    {
                        "role": "user", 
                        "content": f"Generate speech with {emotion} emotion: {text}"
                    }
                ],
                audio_contents=[
                    AudioContent(
                        audio_url=temp_audio_path,
                        raw_audio=None
                    )
                ]
            )
            
            # Generate the audio
            response = engine.generate(
                chat_ml_sample=chat_sample,
                max_new_tokens=1024,
                temperature=0.7,
                force_audio_gen=True
            )
            
            if response.audio is not None:
                # Convert numpy array to WAV format
                audio_data = response.audio
                
                # Create WAV file in memory
                buffer = BytesIO()
                with wave.open(buffer, 'wb') as wav_file:
                    wav_file.setnchannels(1)
                    wav_file.setsampwidth(2)
                    wav_file.setframerate(response.sampling_rate or 16000)
                    
                    # Convert float to int16
                    audio_int16 = (audio_data * 32767).astype(np.int16)
                    wav_file.writeframes(audio_int16.tobytes())
                
                # Get WAV data and encode to base64
                wav_data = buffer.getvalue()
                result_audio_base64 = base64.b64encode(wav_data).decode('utf-8')
                
                return {
                    "success": True,
                    "audio_base64": result_audio_base64,
                    "generated_text": response.generated_text,
                    "sampling_rate": response.sampling_rate or 16000
                }
            else:
                return {"success": False, "error": "No audio generated"}
                
        finally:
            # Clean up temporary file
            if os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Failed to import HiggsAudio modules: {str(e)}"}))
    sys.exit(0)
except Exception as e:
    print(json.dumps({"success": False, "error": f"Generation failed: {str(e)}"}))
    sys.exit(0)

if __name__ == "__main__":
    try:
        data = json.loads(sys.argv[1])
        result = generate_voice(data["text"], data["audio_base64"], data["model_name"], data["emotion"])
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
`;

    let generatedFileName = '';
    
    try {
      // Create temporary Python file
      const tempDir = await Deno.makeTempDir();
      const pythonFile = `${tempDir}/generate_voice.py`;
      await Deno.writeTextFile(pythonFile, pythonScript);

      // Prepare input data
      const inputData = JSON.stringify({
        text,
        audio_base64: audioBase64,
        model_name: modelName,
        emotion
      });

      // Run Python script
      const command = new Deno.Command("python3", {
        args: [pythonFile, inputData],
        stdout: "piped",
        stderr: "piped",
      });

      const process = command.spawn();
      const { code, stdout, stderr } = await process.output();

      // Clean up temp files
      await Deno.remove(tempDir, { recursive: true });

      if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr);
        console.error('Python script error:', errorText);
        throw new Error(`Voice generation failed: ${errorText}`);
      }

      const output = new TextDecoder().decode(stdout);
      const result = JSON.parse(output);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Convert base64 back to buffer for storage
      const generatedAudioBuffer = Uint8Array.from(atob(result.audio_base64), c => c.charCodeAt(0));
      
      // Upload the generated audio to storage
      generatedFileName = `generated/${modelName}/${emotion}/${Date.now()}.wav`;
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('voices')
        .upload(generatedFileName, generatedAudioBuffer, {
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