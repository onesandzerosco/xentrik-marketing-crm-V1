
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
      
      console.log("Creating folder:", folderIdSafe, "for creator:", creatorId);
      
      try {
        // First try to check if the folder already exists
        const { data: existingFolder } = await supabase.storage
          .from('creator_files')
          .list(`${creatorId}/${folderIdSafe}`);
          
        if (!existingFolder || existingFolder.length === 0) {
          // Create an empty file in the folder to "create" the folder in storage
          const { error: storageError } = await supabase.storage
            .from('creator_files')
            .upload(`${creatorId}/${folderIdSafe}/.folder`, new Blob(['']));
          
          if (storageError) {
            console.error("Error creating folder in creator_files:", storageError);
            
            // Try to create the folder in raw_uploads instead
            const { error: rawUploadsError } = await supabase.storage
              .from('raw_uploads')
              .upload(`${creatorId}/${folderIdSafe}/.folder`, new Blob(['']));
              
            if (rawUploadsError) {
              console.error("Error creating folder in raw_uploads:", rawUploadsError);
              updateFileProgress(zipFileName, 0, 'error');
              setFileStatuses(prev => 
                prev.map(status => 
                  status.name === zipFileName
                    ? { ...status, error: `Failed to create folder: ${rawUploadsError.message}` }
                    : status
                )
              );
              return [];
            }
          }
        }
      } catch (folderError) {
        console.error("Exception creating folder:", folderError);
        // Continue anyway, since the folder might already exist
      }
      
      updateFileProgress(zipFileName, 60, 'uploading');
      
      // Upload each extracted file to the newly created folder
      let processedFiles = 0;
      
      console.log(`Processing ${extractedFiles.length} files from ZIP`);
      
      for (const extractedFile of extractedFiles) {
        console.log(`Processing file: ${extractedFile.name}`);
        
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
            console.log(`Generated thumbnail for ${extractedFile.name}:`, thumbnailUrl ? "Success" : "Failed");
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
        
        try {
          // Store metadata in the media table first to establish the record
          console.log("Creating media record for:", uniqueFileName, "in folder:", folderIdSafe);
          
          const { data: mediaRecord, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueFileName,
              mime: extractedFile.content.type || 'application/octet-stream',
              file_size: extractedFile.content.size,
              status: 'uploading',
              folders: [folderIdSafe], // Folder array
              thumbnail_url: thumbnailUrl
            })
            .select('id');
          
          if (mediaError) {
            console.error('Media record creation error:', mediaError);
            console.log('Full media insert payload:', {
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueFileName,
              mime: extractedFile.content.type || 'application/octet-stream',
              file_size: extractedFile.content.size,
              status: 'uploading',
              folders: [folderIdSafe],
              thumbnail_url: thumbnailUrl
            });
            continue;
          }
          
          if (!mediaRecord || mediaRecord.length === 0) {
            console.error('Failed to create media record');
            continue;
          }
          
          const fileId = mediaRecord[0].id;
          extractedFileIds.push(fileId);
          
          console.log("Media record created, ID:", fileId, "now uploading file content");
          
          // Upload the file content
          const { error: uploadError } = await supabase.storage
            .from('raw_uploads')
            .upload(filePath, extractedFile.content, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error(`Upload error for ${uniqueFileName}:`, uploadError);
            
            // Update the media record to mark as error
            await supabase
              .from('media')
              .update({ status: 'error' })
              .eq('id', fileId);
              
            continue;
          }
          
          // Update the media record to mark as complete
          const { error: updateError } = await supabase
            .from('media')
            .update({ 
              status: 'complete',
              folders: [folderIdSafe], // Ensure folder ID is saved
              thumbnail_url: thumbnailUrl // Ensure thumbnail URL is saved
            })
            .eq('id', fileId);
            
          if (updateError) {
            console.error('Error updating media record:', updateError);
          }
          
          processedFiles++;
          const zipProgress = 60 + Math.floor((processedFiles / extractedFiles.length) * 40);
          updateFileProgress(zipFileName, zipProgress, 'uploading');
        } catch (fileError) {
          console.error(`Error processing file ${extractedFile.name}:`, fileError);
          // Continue with next file
        }
      }
      
      // Mark ZIP file as complete when all extracted files are processed
      updateFileProgress(zipFileName, 100, 'complete');
      
      console.log(`ZIP processing complete. Created ${extractedFileIds.length} files in folder ${folderIdSafe}`);
      
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
