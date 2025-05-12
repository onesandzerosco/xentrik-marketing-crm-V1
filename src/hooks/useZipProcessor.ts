
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ZipProcessingOptions } from '@/types/uploadTypes';

export const useZipProcessor = () => {
  const { toast } = useToast();

  const processZipFile = useCallback(async (
    file: File, 
    { creatorId, currentFolder, updateFileProgress, updateFileStatus }: ZipProcessingOptions
  ): Promise<string[]> => {
    updateFileStatus(file.name, 'processing');
    updateFileProgress(file.name, 10);
    
    // Get the base name for folder creation (without .zip extension)
    const folderName = file.name.replace(/\.zip$/i, '');
    const uploadedFileIds: string[] = [];
    
    try {
      // Call the Edge Function to extract the ZIP file
      updateFileProgress(file.name, 30);
      
      // Get signed URL for the zip file upload
      const { data: signedUrlData } = await supabase.storage
        .from('raw_uploads')
        .createSignedUploadUrl(`${creatorId}/${file.name}`);
          
      if (!signedUrlData) {
        throw new Error('Failed to get signed URL for ZIP upload');
      }

      // Upload ZIP file to temporary storage
      const uploadResponse = await fetch(signedUrlData.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload ZIP file');
      }
      
      updateFileProgress(file.name, 50);
      
      // Call the unzip-files Edge Function
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('unzip-files', {
        body: {
          creatorId,
          fileName: file.name,
          targetFolder: folderName,
          currentFolder: currentFolder === 'all' || currentFolder === 'unsorted' ? null : currentFolder
        }
      });
      
      if (extractionError) {
        throw new Error(`ZIP extraction failed: ${extractionError.message}`);
      }
      
      updateFileProgress(file.name, 90);
      
      // Add extracted file IDs to the result
      if (extractionData?.fileIds && Array.isArray(extractionData.fileIds)) {
        uploadedFileIds.push(...extractionData.fileIds);
        
        // Show success message for ZIP extraction
        toast({
          title: "ZIP file processed",
          description: `Created folder "${folderName}" with ${extractionData.fileIds.length} files`,
        });
      }
      
      updateFileProgress(file.name, 100);
      updateFileStatus(file.name, 'complete');
      return uploadedFileIds;
    } catch (zipError) {
      console.error("Error processing ZIP file:", zipError);
      updateFileStatus(file.name, 'error', zipError instanceof Error ? zipError.message : 'Failed to process ZIP file');
      return [];
    }
  }, [toast]);

  return { processZipFile };
};
