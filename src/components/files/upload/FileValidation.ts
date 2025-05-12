
import { useToast } from "@/components/ui/use-toast";
import { isZipFile } from "@/utils/zipUtils";
import { isFileTooLarge } from "@/utils/fileUtils";

export interface FileValidationResult {
  initialStatuses: Array<{
    name: string;
    progress: number;
    status: 'uploading' | 'processing';
  }>;
  validFiles: {
    zipFiles: File[];
    regularFiles: File[];
  };
  hasLargeFiles: boolean;
  hasTooLargeFiles: boolean;
  hasZipFiles: boolean;
}

export const useFileValidation = (maxFileSizeGB: number = 1) => {
  const { toast } = useToast();

  const validateFiles = (files: FileList): FileValidationResult => {
    const initialStatuses: Array<{
      name: string;
      progress: number;
      status: 'uploading' | 'processing';
    }> = [];
    
    let hasLargeFiles = false;
    let hasTooLargeFiles = false;
    let hasZipFiles = false;
    const zipFiles: File[] = [];
    const regularFiles: File[] = [];
    const chunkSize = 5 * 1024 * 1024; // 5MB
    
    // Process each file for validation
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check if file is a ZIP file
      if (isZipFile(file.name)) {
        hasZipFiles = true;
        zipFiles.push(file);
        initialStatuses.push({
          name: file.name,
          progress: 0,
          status: 'processing'
        });
        continue;
      }
      
      regularFiles.push(file);
      
      // Check if file is too large (over maxFileSizeGB)
      if (isFileTooLarge(file, maxFileSizeGB)) {
        toast({
          title: "File too large",
          description: `${file.name} is over ${maxFileSizeGB}GB which exceeds the maximum file size limit.`,
          variant: "destructive",
        });
        hasTooLargeFiles = true;
        continue;
      }
      
      if (file.size > chunkSize) {
        hasLargeFiles = true;
      }
      
      initialStatuses.push({
        name: file.name,
        progress: 0,
        status: 'uploading'
      });
    }

    return {
      initialStatuses,
      validFiles: {
        zipFiles,
        regularFiles: regularFiles.filter(file => !isFileTooLarge(file, maxFileSizeGB))
      },
      hasLargeFiles,
      hasTooLargeFiles,
      hasZipFiles
    };
  };

  const showValidationToasts = (result: FileValidationResult) => {
    const { hasLargeFiles, hasTooLargeFiles, hasZipFiles } = result;
    
    if (hasLargeFiles) {
      toast({
        title: "Large files detected",
        description: "Some files are large and will be uploaded in chunks. This may take a while.",
      });
    }
    
    if (hasTooLargeFiles) {
      toast({
        title: "Some files were skipped",
        description: `Files larger than ${maxFileSizeGB}GB were skipped.`,
      });
    }
    
    if (hasZipFiles) {
      toast({
        title: "ZIP files detected",
        description: "ZIP files will be unpacked automatically into a new folder.",
      });
    }
  };

  return {
    validateFiles,
    showValidationToasts
  };
};
