
import { useState, useCallback } from 'react';
import { UploadingFile, FileProgress } from '@/types/uploadTypes';

export const useFileProgress = (): FileProgress => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const calculateOverallProgress = useCallback(() => {
    if (uploadingFiles.length === 0) return 0;
    const totalProgress = uploadingFiles.reduce((sum, file) => sum + file.progress, 0);
    return totalProgress / uploadingFiles.length;
  }, [uploadingFiles]);

  // Updated to accept fileName (string) instead of File object
  const updateFileProgress = useCallback((fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => {
    setUploadingFiles(prevFiles => {
      const updatedFiles = prevFiles.map(item => 
        item.file.name === fileName ? { 
          ...item, 
          progress,
          status: status || item.status 
        } : item
      );
      
      return updatedFiles;
    });

    // Calculate overall progress
    setUploadingFiles(prevFiles => {
      setOverallProgress(calculateOverallProgress());
      return prevFiles;
    });
  }, [calculateOverallProgress]);

  const updateFileStatus = useCallback((fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => {
    setUploadingFiles(prevFiles => 
      prevFiles.map(item => 
        item.file.name === fileName ? { ...item, status, error } : item
      )
    );
  }, []);

  return {
    uploadingFiles,
    overallProgress,
    setUploadingFiles,
    setOverallProgress,
    updateFileProgress,
    updateFileStatus,
    calculateOverallProgress
  };
};
