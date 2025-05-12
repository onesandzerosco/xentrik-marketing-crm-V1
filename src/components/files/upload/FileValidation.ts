
import { useToast } from "@/components/ui/use-toast";
import { isZipFile } from "@/utils/zipUtils";
import { isFileTooLarge } from "@/utils/fileUtils";

// File validation types
export interface ValidFiles {
  zipFiles: File[];
  regularFiles: File[];
}

export interface FileValidationResult {
  initialStatuses: {
    name: string;
    progress: number;
    status: 'uploading' | 'processing' | 'complete' | 'error';
    error?: string;
    weight?: number; // Add weight property
  }[];
  validFiles: ValidFiles;
  skippedFiles: {
    tooLarge: string[];
    unsupported: string[];
    duplicate: string[];
  };
}

// Helper for validating files before upload
export const useFileValidation = (maxFileSizeGB: number = 1) => {
  const { toast } = useToast();
  
  const validateFiles = (files: FileList): FileValidationResult => {
    const validZipFiles: File[] = [];
    const validRegularFiles: File[] = [];
    const tooLargeFiles: string[] = [];
    const unsupportedFiles: string[] = [];
    const duplicateNames = new Set<string>();
    const duplicateFiles: string[] = [];
    const initialStatuses: any[] = [];
    
    // Check each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check for duplicate file names
      if (duplicateNames.has(file.name)) {
        duplicateFiles.push(file.name);
        continue;
      }
      duplicateNames.add(file.name);
      
      // Check file size
      if (isFileTooLarge(file, maxFileSizeGB)) {
        tooLargeFiles.push(file.name);
        initialStatuses.push({
          name: file.name,
          progress: 0,
          status: 'error',
          error: `File exceeds the maximum allowed size of ${maxFileSizeGB}GB`,
          weight: Math.max(1, Math.ceil(file.size / (100 * 1024 * 1024))) // Weight based on size
        });
        continue;
      }
      
      // Check if it's a ZIP file
      if (isZipFile(file.name)) {
        validZipFiles.push(file);
        initialStatuses.push({
          name: file.name,
          progress: 0,
          status: 'processing',
          weight: Math.max(5, Math.ceil(file.size / (20 * 1024 * 1024))) // ZIP files get higher weight
        });
      } else {
        // Regular file
        validRegularFiles.push(file);
        initialStatuses.push({
          name: file.name,
          progress: 0,
          status: 'uploading',
          weight: Math.max(1, Math.ceil(file.size / (100 * 1024 * 1024))) // Weight based on size
        });
      }
    }
    
    return {
      initialStatuses,
      validFiles: {
        zipFiles: validZipFiles,
        regularFiles: validRegularFiles
      },
      skippedFiles: {
        tooLarge: tooLargeFiles,
        unsupported: unsupportedFiles,
        duplicate: duplicateFiles
      }
    };
  };
  
  // Show toasts based on validation results
  const showValidationToasts = (result: FileValidationResult) => {
    const { skippedFiles, validFiles } = result;
    
    // Show warning for files that are too large
    if (skippedFiles.tooLarge.length > 0) {
      toast({
        title: 'Files too large',
        description: `${skippedFiles.tooLarge.length} ${skippedFiles.tooLarge.length === 1 ? 'file exceeds' : 'files exceed'} the size limit of ${maxFileSizeGB}GB`,
        variant: 'destructive',
      });
    }
    
    // Show warning for duplicate files
    if (skippedFiles.duplicate.length > 0) {
      toast({
        title: 'Duplicate file names',
        description: `${skippedFiles.duplicate.length} ${skippedFiles.duplicate.length === 1 ? 'file was' : 'files were'} skipped due to duplicate names`,
        variant: 'warning',
      });
    }
    
    // If no valid files, show error
    if (validFiles.zipFiles.length === 0 && validFiles.regularFiles.length === 0) {
      toast({
        title: 'No valid files',
        description: 'No valid files were found to upload',
        variant: 'destructive',
      });
    }
  };
  
  return { validateFiles, showValidationToasts };
};
