
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUniqueFileName,
  isVideoFile, 
  generateVideoThumbnail,
  uploadFileInChunks,
  isFileTooLarge
} from '@/utils/fileUtils';
import { isZipFile, extractZipFiles, getZipBaseName } from '@/utils/zipUtils';

// Maximum file size in GB
const MAX_FILE_SIZE_GB = 1;
// 10MB chunks for large files
const CHUNK_SIZE = 10 * 1024 * 1024;

export interface FileUploadStatus {
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  thumbnail?: string; // For video files
}

interface UseFileUploaderProps {
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}

export const useFileUploader = ({ creatorId, onUploadComplete, currentFolder }: UseFileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const { toast } = useToast();
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const calculateOverallProgress = (statuses: FileUploadStatus[]) => {
    if (statuses.length === 0) return 0;
    
    // Filter out completed and error files
    const activeFiles = statuses.filter(file => 
      file.status !== 'complete' && file.status !== 'error'
    );
    
    // If no active files but we have completed files, return 100%
    if (activeFiles.length === 0) {
      if (statuses.some(file => file.status === 'complete')) {
        return 100;
      }
      return 0;
    }
    
    // Calculate the sum of progress for active files
    const totalProgress = activeFiles.reduce((sum, file) => sum + file.progress, 0);
    
    // Return the average progress
    return Math.round(totalProgress / activeFiles.length);
  };

  const updateFileProgress = (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => {
    setFileStatuses(prevStatuses => {
      const updatedStatuses = prevStatuses.map(fileStatus => {
        if (fileStatus.name === fileName) {
          return { 
            ...fileStatus, 
            progress,
            status: status || fileStatus.status
          };
        }
        return fileStatus;
      });
      
      // Calculate and update overall progress
      const newOverallProgress = calculateOverallProgress(updatedStatuses);
      setOverallProgress(newOverallProgress);
      
      return updatedStatuses;
    });
  };

  const handleCancelUpload = (fileName: string) => {
    const controller = abortControllersRef.current.get(fileName);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileName);
    }
    
    setFileStatuses(prev => {
      const newStatuses = prev.filter(status => status.name !== fileName);
      const newOverallProgress = calculateOverallProgress(newStatuses);
      setOverallProgress(newOverallProgress);
      return newStatuses;
    });
  };

  return {
    isUploading,
    setIsUploading,
    fileStatuses,
    setFileStatuses,
    overallProgress,
    setOverallProgress,
    showProgress,
    setShowProgress,
    abortControllersRef,
    calculateOverallProgress,
    updateFileProgress,
    handleCancelUpload,
    MAX_FILE_SIZE_GB,
    CHUNK_SIZE
  };
};
