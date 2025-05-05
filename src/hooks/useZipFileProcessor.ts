
import { supabase } from '@/integrations/supabase/client';
import { getZipBaseName, extractZipFiles } from '@/utils/zipUtils';
import { FileUploadStatus } from './useFileUploader';
import { generateVideoThumbnail, getUniqueFileName } from '@/utils/fileUtils';

interface UseZipFileProcessorProps {
  creatorId: string;
  updateFileProgress: (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => void;
  setFileStatuses: React.Dispatch<React.SetStateAction<FileUploadStatus[]>>;
}

export const useZipFileProcessor = ({ 
  creatorId, 
  updateFileProgress,
  setFileStatuses
}: UseZipFileProcessorProps) => {

  const processZipFile = async (zipFile: File): Promise<string[]> => {
    const zipFileName = zipFile.name;
    const folderName = getZipBaseName(zipFileName);
    const extractedFileIds: string[] = [];
    
    try {
      updateFileProgress(zipFileName, 10, 'processing');
      
      // Extract the files from the ZIP
      const extractedFiles = await extractZipFiles(zipFile);
      updateFileProgress(zipFileName, 30, 'processing');
      
      // Create a new folder with the ZIP file name
      const folderIdSafe = folderName.toLowerCase().replace(/\s+/g, '-');
      
      // Update progress
      updateFileProgress(zipFileName, 50, 'processing');
      
      // Get the user session to ensure we have auth context
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("User is not authenticated for folder creation");
        updateFileProgress(zipFileName, 0, 'error');
        setFileStatuses(prev => 
          prev.map(status => 
            status.name === zipFileName
              ? { ...status, error: 'Authentication required for ZIP processing' }
              : status
          )
        );
        return [];
      }
      
      // Create an empty file in the folder to "create" the folder in storage
      const { error: storageError } = await supabase.storage
        .from('creator_files')
        .upload(`${creatorId}/${folderIdSafe}/.folder`, new Blob(['']));
      
      if (storageError) {
        console.error("Error creating folder in storage:", storageError);
        updateFileProgress(zipFileName, 0, 'error');
        setFileStatuses(prev => 
          prev.map(status => 
            status.name === zipFileName
              ? { ...status, error: `Failed to create folder: ${storageError.message}` }
              : status
          )
        );
        return [];
      }
      
      updateFileProgress(zipFileName, 60, 'uploading');
      
      // Upload each extracted file to the newly created folder
      let processedFiles = 0;
      let folderCreated = false;
      
      for (const extractedFile of extractedFiles) {
        // Generate thumbnail for videos from zip
        let thumbnailUrl = null;
        if (extractedFile.isVideo) {
          try {
            // Convert the Blob to File for thumbnail generation
            const videoFile = new File(
              [extractedFile.content], 
              extractedFile.name, 
              { type: extractedFile.content.type || 'video/mp4' }
            );
            thumbnailUrl = await generateVideoThumbnail(videoFile);
          } catch (err) {
            console.error('Error generating video thumbnail for zip file:', err);
            // Continue without thumbnail
          }
        }
        
        const uniqueFileName = await getUniqueFileName(
          extractedFile.name, 
          folderIdSafe, 
          creatorId, 
          'raw_uploads',
          supabase
        );
        
        const filePath = `${creatorId}/${folderIdSafe}/${uniqueFileName}`;
        
        // Store metadata in the media table
        const { data: mediaRecord, error: mediaError } = await supabase
          .from('media')
          .insert({
            creator_id: creatorId,
            bucket_key: filePath,
            filename: uniqueFileName,
            mime: extractedFile.content.type || 'application/octet-stream',
            file_size: extractedFile.content.size,
            status: 'uploading',
            folders: folderCreated ? [folderIdSafe] : [folderIdSafe], // Always include folder
            thumbnail_url: thumbnailUrl // Add the thumbnail URL if generated
          })
          .select('id');
        
        if (mediaError) {
          console.error('Media record creation error:', mediaError);
          continue;
        }
        
        if (!mediaRecord || mediaRecord.length === 0) {
          console.error('Failed to create media record');
          continue;
        }
        
        const fileId = mediaRecord[0].id;
        extractedFileIds.push(fileId);
        
        // Upload the file content
        const { error: uploadError } = await supabase.storage
          .from('raw_uploads')
          .upload(filePath, extractedFile.content, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Upload error for ${uniqueFileName}:`, uploadError);
          await supabase
            .from('media')
            .update({ status: 'error' })
            .eq('id', fileId);
          continue;
        }
        
        // Update the media record to mark as complete
        await supabase
          .from('media')
          .update({ 
            status: 'complete',
            folders: [folderIdSafe], // Add to folder
            thumbnail_url: thumbnailUrl // Ensure thumbnail URL is saved
          })
          .eq('id', fileId);
        
        processedFiles++;
        const zipProgress = 60 + Math.floor((processedFiles / extractedFiles.length) * 40);
        updateFileProgress(zipFileName, zipProgress, 'uploading');
        
        // After first file, indicate that folder exists for remaining files
        if (!folderCreated) {
          folderCreated = true;
        }
      }
      
      // Mark ZIP file as complete when all extracted files are processed
      updateFileProgress(zipFileName, 100, 'complete');
      
      return extractedFileIds;
      
    } catch (error) {
      console.error(`Error processing ZIP file ${zipFileName}:`, error);
      updateFileProgress(zipFileName, 0, 'error');
      setFileStatuses(prev => 
        prev.map(status => 
          status.name === zipFileName
            ? { ...status, error: error instanceof Error ? error.message : 'Failed to process ZIP file' }
            : status
        )
      );
      return [];
    }
  };

  return { processZipFile };
};
