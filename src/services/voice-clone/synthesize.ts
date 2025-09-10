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
  jobId?: string;
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
    
    // Step 1: Create pending record and generate job_id
    const jobId = `voice-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: pendingRecord, error: insertError } = await supabase
      .from('generated_voice_clones')
      .insert({
        model_name: modelName,
        emotion: emotion,
        generated_text: text,
        generated_by: (await supabase.auth.getUser()).data.user?.id,
        job_id: jobId,
        status: 'Pending',
        bucket_key: '',
        audio_url: ''
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create pending record:', insertError);
      throw new Error(`Failed to create pending record: ${insertError.message}`);
    }

    console.log('✅ Pending record created:', pendingRecord.id);

    // Step 2: Call the voice generation edge function with job_id
    console.log('Calling edge function with params:', {
      text,
      modelName,
      emotion,
      jobId
    });

    const { data, error } = await supabase.functions.invoke('voice-generate', {
      body: {
        text,
        modelName,
        emotion,
        jobId
      }
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Voice synthesis error:', error);
      throw new Error(`Voice synthesis failed: ${error.message || 'Unknown error'}`);
    }

    console.log('Voice generation API response:', data);

    // Return success response with job info
    return {
      audioUrl: data?.data?.bucket_key ? supabase.storage.from('voices').getPublicUrl(data.data.bucket_key).data.publicUrl : '',
      generatedPath: data?.data?.bucket_key || '',
      jobId: jobId
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