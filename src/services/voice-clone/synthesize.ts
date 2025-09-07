import { supabase } from '@/integrations/supabase/client';

export interface SynthesizeParams {
  text: string;
  modelName: string;
  emotion: string;
  sourceKey: string;
}

export interface SynthesizeResult {
  audioUrl: string;
  audioBuffer?: ArrayBuffer;
  generatedPath?: string;
}

/**
 * Synthesize voice using the voice cloning engine
 * This is a wrapper around the voice cloning functionality
 * 
 * @param params - Parameters for voice synthesis
 * @returns Promise<SynthesizeResult> - Generated audio result
 */
export async function synthesize(params: SynthesizeParams): Promise<SynthesizeResult> {
  const { text, modelName, emotion } = params;

  try {
    console.log('Starting voice synthesis:', { text, modelName, emotion });
    
    // Call the voice generation edge function to start the job
    const { data, error } = await supabase.functions.invoke('voice-generate', {
      body: {
        text,
        modelName,
        emotion
      }
    });

    if (error) {
      console.error('Voice synthesis error:', error);
      throw new Error(`Voice synthesis failed: ${error.message}`);
    }

    console.log('Voice generation job started:', data);

    // Return success response - the actual generation happens in background
    // User will see the completed voice in the table once it's done
    return {
      audioUrl: '', // No immediate audio URL since it's background processing
      generatedPath: ''
    };

  } catch (error) {
    console.error('Voice synthesis error:', error);
    throw error;
  }
}

/**
 * Download generated audio file
 * 
 * @param audioUrl - URL of the generated audio
 * @param filename - Filename for the download
 */
export function downloadAudio(audioUrl: string, filename: string = 'generated_voice.wav'): void {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default synthesize;