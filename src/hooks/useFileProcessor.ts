
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUniqueFileName } from '@/utils/fileUtils';

export const useFileProcessor = () => {
  const processRegularFile = useCallback(async (
    file: File,
    creatorId: string,
    currentFolder: string,
    updateFileProgress: (fileName: string, progress: number) => void,
    updateFileStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void
  ): Promise<string | null> => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSafeName = await getUniqueFileName(
      safeName, 
      currentFolder, 
      creatorId, 
      'raw_uploads',
      supabase
    );
    
    const filePath = `${creatorId}/${uniqueSafeName}`;
    
    // Custom upload with progress tracking
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        updateFileProgress(file.name, percentComplete);
      }
    });
    
    // Create a promise to track the XHR request
    const uploadPromise = new Promise<string | null>((resolve, reject) => {
      xhr.onload = async function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateFileStatus(file.name, 'complete');
          
          // Add folder reference
          let folderArray: string[] = [];
          if (currentFolder && currentFolder !== 'shared' && currentFolder !== 'unsorted') {
            folderArray = [currentFolder];
          }
          
          // Store metadata in media table
          const { data: mediaRecord, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueSafeName,
              mime: file.type,
              file_size: file.size,
              status: 'complete',
              folders: folderArray
            })
            .select('id');
            
          if (mediaError) {
            updateFileStatus(file.name, 'error', 'Failed to create media record');
            reject(mediaError);
            return null;
          } else if (mediaRecord && mediaRecord[0]) {
            resolve(mediaRecord[0].id);
            return mediaRecord[0].id;
          } else {
            resolve(null);
            return null;
          }
        } else {
          updateFileStatus(file.name, 'error', `Upload failed: ${xhr.statusText}`);
          reject(new Error(`Upload failed: ${xhr.statusText}`));
          return null;
        }
      };
      
      xhr.onerror = function() {
        updateFileStatus(file.name, 'error', 'Network error during upload');
        reject(new Error('Network error during upload'));
      };
    });
    
    // Get signed URL and upload
    const { data: signedUrlData } = await supabase.storage
      .from('raw_uploads')
      .createSignedUploadUrl(filePath);
      
    if (signedUrlData) {
      xhr.open('PUT', signedUrlData.signedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
      
      try {
        return await uploadPromise;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        return null;
      }
    }
    
    return null;
  }, []);

  return { processRegularFile };
};
