
import { supabase } from '@/integrations/supabase/client';
import { 
  isVideoFile, 
  generateVideoThumbnail, 
  getUniqueFileName,
  uploadFileInChunks,
  isFileTooLarge
} from '@/utils/fileUtils';
import { FileUploadStatus } from './useFileUploader';

interface UseFileProcessorProps {
  creatorId: string;
  currentFolder: string;
  updateFileProgress: (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => void;
  setFileStatuses: React.Dispatch<React.SetStateAction<FileUploadStatus[]>>;
  chunkSize: number;
  maxFileSizeGB: number;
  abortControllersRef: React.MutableRefObject<Map<string, AbortController>>;
}

export const useFileProcessor = ({
  creatorId,
  currentFolder,
  updateFileProgress,
  setFileStatuses,
  chunkSize,
  maxFileSizeGB,
  abortControllersRef
}: UseFileProcessorProps) => {

  const processRegularFile = async (file: File): Promise<string | null> => {
    // Skip files that are too large
    if (isFileTooLarge(file, maxFileSizeGB)) return null;
    
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    try {
      // Generate thumbnail for videos
      let thumbnailUrl = null;
      if (isVideoFile(file.name)) {
        updateFileProgress(file.name, 0, 'processing');
        try {
          thumbnailUrl = await generateVideoThumbnail(file);
          console.log(`Generated thumbnail for ${file.name}:`, thumbnailUrl ? 'Success' : 'Failed');
          
          // Update the UI with the thumbnail
          setFileStatuses(prev => 
            prev.map(status => 
              status.name === file.name 
                ? { ...status, thumbnail: thumbnailUrl, status: 'uploading' } 
                : status
            )
          );
        } catch (err) {
          console.error('Error generating video thumbnail:', err);
          // Continue without thumbnail
        }
      }
      
      // Create a unique file name
      const uniqueSafeName = await getUniqueFileName(
        safeName, 
        currentFolder === 'all' ? 'unsorted' : currentFolder, // Use unsorted if all files is selected
        creatorId, 
        'raw_uploads',
        supabase
      );

      // Create an AbortController for this file
      const abortController = new AbortController();
      abortControllersRef.current.set(file.name, abortController);
      
      const filePath = `${creatorId}/${currentFolder === 'all' ? 'unsorted' : currentFolder}/${uniqueSafeName}`;
      
      // Determine folder array based on current folder
      let folderArray: string[] = [];
      if (currentFolder !== 'all') {
        folderArray = [currentFolder];
      }
      
      // Store metadata in the media table first
      const { data: mediaRecord, error: mediaError } = await supabase
        .from('media')
        .insert({
          creator_id: creatorId,
          bucket_key: filePath,
          filename: uniqueSafeName,
          mime: file.type,
          file_size: file.size,
          status: 'uploading', // Mark as uploading initially
          folders: folderArray,
          thumbnail_url: thumbnailUrl // Store the thumbnail URL
        })
        .select('id');
      
      if (mediaError) {
        console.error('Media record creation error:', mediaError);
        updateFileProgress(file.name, 0, 'error');
        return null;
      }
      
      if (!mediaRecord || mediaRecord.length === 0) {
        console.error('Failed to create media record');
        updateFileProgress(file.name, 0, 'error');
        return null;
      }
      
      const fileId = mediaRecord[0].id;
      console.log(`Created media record for ${file.name} with ID ${fileId}, thumbnail:`, thumbnailUrl);
      
      try {
        if (file.size > chunkSize) {
          // Handle large file upload using custom chunked upload
          await uploadFileInChunks(
            file, 
            'raw_uploads', 
            filePath,
            (progress) => updateFileProgress(file.name, progress),
            supabase
          );
        } else {
          // For small files, we'll manually track progress
          // Start the upload
          const { error: uploadError } = await supabase.storage
            .from('raw_uploads')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          // Since we can't track progress directly, we'll simulate progress
          // with incremental updates
          for (let percent = 0; percent <= 100; percent += 10) {
            updateFileProgress(file.name, percent);
            // Only add a small delay for the last few percents to appear smooth
            if (percent > 70) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
        }
        
        // Update the media record to mark as complete
        const { error: updateError } = await supabase
          .from('media')
          .update({ 
            status: 'complete', 
            thumbnail_url: thumbnailUrl // Save the thumbnail URL if it exists
          })
          .eq('id', fileId);
          
        if (updateError) {
          console.error('Error updating media record:', updateError);
        }
        
        updateFileProgress(file.name, 100, 'complete');
        return fileId;
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        
        // Update the media record to mark as failed
        await supabase
          .from('media')
          .update({ status: 'error' })
          .eq('id', fileId);
          
        updateFileProgress(file.name, 0, 'error');
        
        setFileStatuses(prev => 
          prev.map(status => 
            status.name === file.name 
              ? { 
                  ...status, 
                  error: error instanceof Error ? error.message : 'Upload failed',
                  status: 'error'
                } 
              : status
          )
        );
        
        return null;
      }
      
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      updateFileProgress(
        file.name, 
        0, 
        'error'
      );
      setFileStatuses(prev => 
        prev.map(status => 
          status.name === file.name 
            ? { ...status, error: error instanceof Error ? error.message : 'Upload failed' } 
            : status
        )
      );
      return null;
    }
  };

  return { processRegularFile };
};
