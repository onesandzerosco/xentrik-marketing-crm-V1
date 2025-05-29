
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { FileUploadOptions } from '@/types/uploadTypes';
import { isZipFile } from '@/utils/zipUtils';
import { useZipFileProcessor } from '@/hooks/useZipFileProcessor';
import { useFileProcessor } from '@/hooks/useFileProcessor';

interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export const useDragDropUploader = ({ 
  creatorId, 
  onUploadComplete, 
  currentFolder 
}: FileUploadOptions) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const calculateOverallProgress = useCallback(() => {
    if (uploadingFiles.length === 0) return 0;
    const totalProgress = uploadingFiles.reduce((sum, file) => sum + file.progress, 0);
    return totalProgress / uploadingFiles.length;
  }, [uploadingFiles]);

  const updateFileProgress = useCallback((fileName: string, progress: number) => {
    setUploadingFiles(prevFiles => {
      const updatedFiles = prevFiles.map(item => 
        item.file.name === fileName ? { 
          ...item, 
          progress 
        } : item
      );
      
      // Calculate and set overall progress
      const totalProgress = updatedFiles.reduce((sum, file) => sum + file.progress, 0);
      setOverallProgress(updatedFiles.length > 0 ? totalProgress / updatedFiles.length : 0);
      
      return updatedFiles;
    });
  }, []);

  const updateFileStatus = useCallback((fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => {
    setUploadingFiles(prevFiles => 
      prevFiles.map(item => 
        item.file.name === fileName ? { ...item, status, error } : item
      )
    );
  }, []);
  
  const { processZipFile } = useZipFileProcessor({
    creatorId,
    updateFileProgress,
    setFileStatuses: setUploadingFiles
  });
  const { processRegularFile } = useFileProcessor();

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadingFiles(
      acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading' as const
      }))
    );
    
    const uploadedFileIds: string[] = [];

    try {
      // Process files by type (ZIP vs regular)
      for (const file of acceptedFiles) {
        if (isZipFile(file.name)) {
          const extractedFileIds = await processZipFile(file);
          uploadedFileIds.push(...extractedFileIds);
          continue;
        }
        
        // Fix: Use a wrapper function that calls updateFileProgress correctly
        const completeCallback = (fileName: string) => {
          updateFileProgress(fileName, 100);
        };
        
        const fileId = await processRegularFile(
          file,
          creatorId,
          currentFolder,
          completeCallback,
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
