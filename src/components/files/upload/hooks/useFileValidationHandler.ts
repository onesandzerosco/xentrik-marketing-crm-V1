
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FileValidationResult } from '../FileValidation';
import { useFileValidation } from '../FileValidation';
import { FileUploadStatus } from '@/hooks/useFileUploader';

interface UseFileValidationHandlerProps {
  MAX_FILE_SIZE_GB: number;
  setFileStatuses: (status: FileUploadStatus[]) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useFileValidationHandler = ({
  MAX_FILE_SIZE_GB,
  setFileStatuses,
  setIsUploading
}: UseFileValidationHandlerProps) => {
  const { toast } = useToast();
  const { validateFiles, showValidationToasts } = useFileValidation(MAX_FILE_SIZE_GB);

  const handleValidateFiles = (files: FileList): FileValidationResult | null => {
    if (!files || files.length === 0) return null;
    
    // Set initial uploading state
    setIsUploading(true);
    
    // Validate the selected files
    const validationResult = validateFiles(files);
    
    // Show validation toasts for any issues
    showValidationToasts(validationResult);
    
    // Set initial statuses for the files
    setFileStatuses(validationResult.initialStatuses as FileUploadStatus[]);
    
    if (validationResult.initialStatuses.length === 0) {
      setIsUploading(false);
      return null;
    }
    
    return validationResult;
  };

  return {
    handleValidateFiles
  };
};
