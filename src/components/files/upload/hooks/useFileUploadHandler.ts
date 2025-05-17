
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useFileUploader } from '@/hooks/useFileUploader';
import { useFileValidationHandler } from './useFileValidationHandler';
import { useFileProcessingHandler } from './useFileProcessingHandler';
import { Category } from '@/types/fileTypes';

interface UseFileUploadHandlerProps {
  creatorId: string;
  currentFolder: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  availableCategories?: Category[];
}

export const useFileUploadHandler = ({
  creatorId,
  currentFolder,
  onUploadComplete,
  availableCategories = []
}: UseFileUploadHandlerProps) => {
  const { toast } = useToast();
  
  // Use the core file uploader hook
  const {
    isUploading,
    setIsUploading,
    fileStatuses,
    setFileStatuses,
    overallProgress,
    showProgress,
    setShowProgress,
    abortControllersRef,
    updateFileProgress,
    handleCancelUpload,
    MAX_FILE_SIZE_GB,
    CHUNK_SIZE
  } = useFileUploader({ 
    creatorId, 
    onUploadComplete, 
    currentFolder 
  });

  // Use the file validation hook
  const { handleValidateFiles } = useFileValidationHandler({
    MAX_FILE_SIZE_GB,
    setFileStatuses,
    setIsUploading
  });
  
  // Use the file processing hook
  const { processFiles } = useFileProcessingHandler({
    creatorId,
    currentFolder,
    updateFileProgress,
    setFileStatuses
  });

  // Main file change handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string }) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setShowProgress(true);
    setFileStatuses([]);
    abortControllersRef.current.clear();
    
    try {
      // Get the category ID for zip files
      const zipCategoryId = e.zipCategoryId;
      
      // Validate files and get results
      const validationResult = handleValidateFiles(files);
      if (!validationResult) {
        setIsUploading(false);
        e.target.value = '';
        return;
      }
      
      const { validFiles } = validationResult;
      
      if (fileStatuses.length === 0) {
        setIsUploading(false);
        e.target.value = '';
        return;
      }
      
      // Process the files
      const uploadedFileIds = await processFiles(validFiles.zipFiles, validFiles.regularFiles, zipCategoryId);
      
      // Show success message for successful uploads
      const successfulUploads = fileStatuses.filter(f => f.status === 'complete').length;
      if (successfulUploads > 0) {
        toast({
          title: successfulUploads > 1 
            ? `${successfulUploads} files uploaded` 
            : '1 file uploaded',
          description: `Successfully uploaded ${successfulUploads} files`,
        });
      }
      
      // Reset the input
      if (e.target.value) {
        e.target.value = '';
      }
      
      // Call the callback if it exists
      if (onUploadComplete && uploadedFileIds.length > 0) {
        onUploadComplete(uploadedFileIds);
        
        // Hide progress after a delay
        setTimeout(() => {
          setShowProgress(false);
        }, 3000);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload the file(s)',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    fileStatuses,
    overallProgress,
    showProgress,
    setShowProgress,
    handleFileChange,
    handleCancelUpload,
    MAX_FILE_SIZE_GB
  };
};
