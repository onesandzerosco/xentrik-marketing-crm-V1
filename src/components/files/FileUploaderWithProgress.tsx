
import React from 'react';
import FileUploadProgress from './upload/FileUploadProgress';
import { useFileUploadHandler } from './upload/hooks/useFileUploadHandler';
import { Category } from '@/types/fileTypes';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
  availableCategories?: Category[];
}

const FileUploaderWithProgress: React.FC<FileUploaderProps> = ({ 
  id, 
  creatorId, 
  onUploadComplete,
  currentFolder,
  availableCategories = []
}) => {
  const {
    isUploading,
    fileStatuses,
    overallProgress,
    showProgress,
    setShowProgress,
    handleFileChange,
    handleCancelUpload
  } = useFileUploadHandler({ 
    creatorId, 
    onUploadComplete, 
    currentFolder,
    availableCategories
  });

  return (
    <>
      <input
        id={id}
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip"
      />
      
      {/* Progress display overlay */}
      {showProgress && 
        <FileUploadProgress 
          fileStatuses={fileStatuses} 
          overallProgress={overallProgress} 
          onClose={() => setShowProgress(false)}
          onCancelUpload={handleCancelUpload}
        />
      }
    </>
  );
};

export default FileUploaderWithProgress;
