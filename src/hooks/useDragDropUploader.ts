
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FileUploadOptions } from '@/types/uploadTypes';
import { isZipFile } from '@/utils/zipUtils';
import { useFileProgress } from '@/hooks/useFileProgress';
import { useZipProcessor } from '@/hooks/useZipProcessor';
import { useFileProcessor } from '@/hooks/useFileProcessor';

export const useDragDropUploader = ({ 
  creatorId, 
  onUploadComplete, 
  currentFolder 
}: FileUploadOptions) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  
  const {
    uploadingFiles,
    overallProgress,
    setUploadingFiles,
    updateFileProgress,
    updateFileStatus
  } = useFileProgress();
  
  const { processZipFile } = useZipProcessor();
  const { processRegularFile } = useFileProcessor();

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadingFiles(
      acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading'
      }))
    );
    
    const uploadedFileIds: string[] = [];

    try {
      // Process files by type (ZIP vs regular)
      for (const file of acceptedFiles) {
        if (isZipFile(file.name)) {
          const extractedFileIds = await processZipFile(file, {
            creatorId,
            currentFolder,
            updateFileProgress,
            updateFileStatus
          });
          uploadedFileIds.push(...extractedFileIds);
          continue;
        }
        
        // Regular file upload (non-ZIP)
        const fileId = await processRegularFile(
          file,
          creatorId,
          currentFolder,
          updateFileProgress,
          updateFileStatus
        );
        
        if (fileId) {
          uploadedFileIds.push(fileId);
        }
      }

      const successfulUploads = uploadingFiles.filter(f => f.status === 'complete').length;
      if (successfulUploads > 0) {
        toast({
          title: successfulUploads > 1 
            ? `${successfulUploads} files uploaded` 
            : '1 file uploaded',
          description: `Successfully uploaded ${successfulUploads} files`,
        });
      }
      
      if (onUploadComplete) {
        onUploadComplete(uploadedFileIds.length > 0 ? uploadedFileIds : undefined);
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
    handleUpload,
    isUploading,
    uploadingFiles,
    overallProgress
  };
};
