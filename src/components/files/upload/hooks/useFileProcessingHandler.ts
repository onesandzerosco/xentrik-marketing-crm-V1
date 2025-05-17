
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useZipProcessor } from '@/hooks/useZipProcessor';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import { FileUploadStatus } from '@/hooks/useFileUploader';

interface UseFileProcessingHandlerProps {
  creatorId: string;
  currentFolder: string;
  updateFileProgress: (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => void;
  setFileStatuses: (status: FileUploadStatus[] | ((prev: FileUploadStatus[]) => FileUploadStatus[])) => void;
}

export const useFileProcessingHandler = ({
  creatorId,
  currentFolder,
  updateFileProgress,
  setFileStatuses
}: UseFileProcessingHandlerProps) => {
  const { toast } = useToast();
  const { processZipFile } = useZipProcessor();
  const { processRegularFile } = useFileProcessor();
  
  // Process both zip and regular files
  const processFiles = async (
    zipFiles: File[], 
    regularFiles: File[], 
    zipCategoryId?: string
  ): Promise<string[]> => {
    const uploadedFileIds: string[] = [];

    // First handle the ZIP files
    for (const zipFile of zipFiles) {
      const extractedFileIds = await processZipFile(zipFile, {
        creatorId,
        currentFolder,
        categoryId: zipCategoryId, // Pass the selected category ID for ZIP files
        updateFileProgress: (fileName, progress) => updateFileProgress(fileName, progress),
        updateFileStatus: (fileName, status, error) => {
          const newStatus = status === 'uploading' ? 'uploading' 
            : status === 'processing' ? 'processing'
            : status === 'complete' ? 'complete' 
            : 'error';
          updateFileProgress(fileName, 100, newStatus);
          if (error) {
            setFileStatuses((prev: FileUploadStatus[]) => 
              prev.map(s => 
                s.name === fileName ? { ...s, error } : s
              )
            );
          }
        }
      });
      uploadedFileIds.push(...extractedFileIds);
      
      // Add the newly created folder to available folders list (will be picked up on refresh)
      const folderName = zipFile.name.split('.')[0];
      toast({
        title: "ZIP file processed",
        description: `Created folder "${folderName}" with ${extractedFileIds.length} files`,
      });
    }
    
    // Process regular files sequentially to avoid overwhelming the API
    for (const file of regularFiles) {
      // Skip files that are too large (already warned)
      if (file.size > 1 * 1024 * 1024 * 1024) continue;
      
      console.log(`Processing file ${file.name} for folder: ${currentFolder}`);
      
      const fileId = await processRegularFile(
        file,
        creatorId,
        currentFolder,
        (fileName) => updateFileProgress(fileName, 100),
        (fileName, status, error) => {
          const newStatus = status === 'uploading' ? 'uploading' 
            : status === 'processing' ? 'processing'
            : status === 'complete' ? 'complete' 
            : 'error';
          updateFileProgress(fileName, 100, newStatus);
          if (error) {
            setFileStatuses((prev: FileUploadStatus[]) => 
              prev.map(s => 
                s.name === fileName ? { ...s, error } : s
              )
            );
          }
        }
      );
      
      if (fileId) {
        uploadedFileIds.push(fileId);
      }
    }

    return uploadedFileIds;
  };

  return {
    processFiles
  };
};
