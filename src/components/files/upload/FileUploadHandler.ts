
import { useFileUploader } from "@/hooks/useFileUploader";
import { useZipProcessor } from "@/hooks/useZipProcessor";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useFileValidation, FileValidationResult } from "./FileValidation";
import { useToast } from "@/components/ui/use-toast";
import { FileUploadStatus } from "@/hooks/useFileUploader";

interface FileUploadHandlerProps {
  creatorId: string;
  currentFolder: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
}

export const useFileUploadHandler = ({
  creatorId,
  currentFolder,
  onUploadComplete
}: FileUploadHandlerProps) => {
  const { toast } = useToast();
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

  // Use file validation hook
  const { validateFiles, showValidationToasts } = useFileValidation(MAX_FILE_SIZE_GB);
  
  // Use hooks for file processing
  const { processZipFile } = useZipProcessor();
  const { processRegularFile } = useFileProcessor();

  // Main file change handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setShowProgress(true);
    setFileStatuses([]);
    abortControllersRef.current.clear();
    
    try {
      // Validate files and get results
      const validationResult = validateFiles(files);
      const { initialStatuses, validFiles } = validationResult;
      
      // Show relevant toasts based on validation
      showValidationToasts(validationResult);
      
      // Set initial file statuses
      setFileStatuses(initialStatuses as FileUploadStatus[]);
      
      if (initialStatuses.length === 0) {
        setIsUploading(false);
        e.target.value = '';
        return;
      }
      
      // Process the files
      const uploadedFileIds = await processFiles(validFiles.zipFiles, validFiles.regularFiles);
      
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
      e.target.value = '';
      
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

  // Process both zip and regular files
  const processFiles = async (zipFiles: File[], regularFiles: File[]): Promise<string[]> => {
    const uploadedFileIds: string[] = [];

    // First handle the ZIP files
    for (const zipFile of zipFiles) {
      const extractedFileIds = await processZipFile(zipFile, {
        creatorId,
        currentFolder,
        updateFileProgress: (fileName, progress) => updateFileProgress(fileName, progress),
        updateFileStatus: (fileName, status, error) => {
          const newStatus = status === 'uploading' ? 'uploading' 
            : status === 'processing' ? 'processing'
            : status === 'complete' ? 'complete' 
            : 'error';
          updateFileProgress(fileName, 100, newStatus);
          if (error) {
            setFileStatuses(prev => 
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
      if (file.size > MAX_FILE_SIZE_GB * 1024 * 1024 * 1024) continue;
      
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
            setFileStatuses(prev => 
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
