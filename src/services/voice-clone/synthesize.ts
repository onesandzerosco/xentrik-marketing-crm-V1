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
  const { text, modelName, emotion, sourceKey } = params;

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

    // If we got a job ID, poll for completion
    if (data.jobId && data.status === 'processing') {
      return await pollForJobCompletion(data.jobId);
    }

    // Fallback for backward compatibility
    return {
      audioUrl: data.audioUrl || '',
      generatedPath: data.generatedPath || ''
    };

  } catch (error) {
    console.error('Voice synthesis error:', error);
    throw error;
  }
}

/**
 * Poll for job completion
 */
async function pollForJobCompletion(jobId: string): Promise<SynthesizeResult> {
  const maxAttempts = 60; // 5 minutes max (5 second intervals)
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      // Use direct fetch for GET request with query parameters
      const statusUrl = `https://rdzwpiokpyssqhnfiqrt.supabase.co/functions/v1/voice-status?jobId=${jobId}`;
      const response = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(s => s.data.session?.access_token || '')}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkendwaW9rcHlzc3FobmZpcXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2Njc3MTIsImV4cCI6MjA2MDI0MzcxMn0.aUc4NpSjXMG-KQs7FeDPJTjZxp4ehJxvGi5-kk3CZRE'
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      const statusData = await response.json();

      if (statusData.status === 'completed') {
        console.log('Voice generation completed:', statusData);
        return {
          audioUrl: statusData.audioUrl,
          generatedPath: statusData.audioUrl
        };
      } else if (statusData.status === 'failed') {
        throw new Error(`Voice generation failed: ${statusData.errorMessage || 'Unknown error'}`);
      }

      // Still processing, wait and try again
      console.log(`Job ${jobId} still processing, attempt ${attempts + 1}/${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      attempts++;

    } catch (error) {
      console.error('Error polling for job completion:', error);
      if (attempts >= maxAttempts - 1) {
        throw new Error('Voice generation timed out. Please try again.');
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
  }

  throw new Error('Voice generation timed out after 5 minutes. Please try again.');
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