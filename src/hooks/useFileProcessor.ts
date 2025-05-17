
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  getUniqueFileName,
  isVideoFile,
  generateVideoThumbnail,
  uploadFileInChunks,
} from '@/utils/fileUtils';

export const useFileProcessor = () => {
  // Process a regular (non-zip) file upload
  const processRegularFile = async (
    file: File,
    creatorId: string,
    currentFolder: string,
    onComplete: (fileName: string) => void,
    onStatus: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void,
  ): Promise<string | null> => {
    try {
      onStatus(file.name, 'uploading');

      // Generate a thumbnail for video files
      let thumbnailUrl: string | null = null;
      if (isVideoFile(file.name)) {
        try {
          thumbnailUrl = await generateVideoThumbnail(file);
        } catch (error) {
          console.error('Error generating video thumbnail:', error);
        }
      }

      // Get a unique file name to prevent collisions
      const uniqueFileName = await getUniqueFileName(
        file.name, 
        `${creatorId}/${currentFolder || 'unsorted'}`, 
        creatorId,
        'raw_uploads',
        supabase
      );
      
      // Construct the file path for storage
      const filePath = `${creatorId}/${currentFolder || 'unsorted'}/${uniqueFileName}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('raw_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        onStatus(file.name, 'error', `Upload failed: ${uploadError.message}`);
        return null;
      }

      // Create a public URL for the uploaded file
      const { data: publicUrlData } = await supabase.storage
        .from('raw_uploads')
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        console.error('Error getting public URL for file');
        onStatus(file.name, 'error', 'Failed to get public URL for uploaded file');
        return null;
      }

      // Save the file metadata to the database
      const folderList = currentFolder === 'all' || currentFolder === 'unsorted' 
        ? [currentFolder]
        : ['all', currentFolder];
      
      console.log(`Saving file to database with folders: ${folderList} and current folder: ${currentFolder}`);
      
      const { data: fileData, error: fileError } = await supabase
        .from('media')
        .insert({
          creator_id: creatorId,
          filename: uniqueFileName,
          file_size: file.size,
          mime: file.type,
          bucket_key: filePath,
          folders: folderList,
          thumbnail_url: thumbnailUrl
        })
        .select('id')
        .single();

      if (fileError) {
        console.error('Error saving file metadata:', fileError);
        onStatus(file.name, 'error', `Database error: ${fileError.message}`);
        return null;
      }

      onStatus(file.name, 'complete');
      onComplete(file.name);
      
      return fileData.id;
    } catch (error) {
      console.error('Error processing file:', error);
      onStatus(file.name, 'error', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };

  return {
    processRegularFile
  };
};
