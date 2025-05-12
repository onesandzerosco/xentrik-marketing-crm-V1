
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

  const updateFileProgress = useCallback((file: File, progress: number) => {
    setUploadingFiles(prevFiles => {
      const updatedFiles = prevFiles.map(item => 
        item.file.name === file.name ? { ...item, progress } : item
      );
      
      return updatedFiles;
    });

    // Calculate overall progress
    setUploadingFiles(prevFiles => {
      setOverallProgress(calculateOverallProgress());
      return prevFiles;
    });
  }, [calculateOverallProgress]);

  const updateFileStatus = useCallback((file: File, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => {
    setUploadingFiles(prevFiles => 
      prevFiles.map(item => 
        item.file.name === file.name ? { ...item, status, error } : item
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
