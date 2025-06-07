import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface FileUploadStatus {
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  thumbnail?: string; // Added thumbnail property
}

interface UseFileUploaderProps {
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}

export const useFileUploader = ({
  creatorId,
  onUploadComplete,
  currentFolder
}: UseFileUploaderProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const MAX_FILE_SIZE_GB = 2;
  const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

  const updateFileProgress = (fileName: string, progress: number, status?: FileUploadStatus['status']) => {
    setFileStatuses(prev => prev.map(file => 
      file.name === fileName 
        ? { ...file, progress, ...(status && { status }) }
        : file
    ));
    
    // Calculate overall progress
    setFileStatuses(prev => {
      const totalProgress = prev.reduce((sum, file) => sum + file.progress, 0);
      const avgProgress = prev.length > 0 ? totalProgress / prev.length : 0;
      setOverallProgress(avgProgress);
      return prev;
    });
  };

  const handleCancelUpload = () => {
    // Cancel all ongoing uploads
    abortControllersRef.current.forEach(controller => {
      controller.abort();
    });
    abortControllersRef.current.clear();
    
    setIsUploading(false);
    setShowProgress(false);
    setFileStatuses([]);
    setOverallProgress(0);
    
    toast({
      title: "Upload cancelled",
      description: "All uploads have been cancelled",
    });
  };

  return {
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
  };
};
