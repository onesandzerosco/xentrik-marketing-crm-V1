
import React, { useCallback, useState } from 'react';
import { DropZone } from './DropZone';
import { UploadActions } from './UploadActions';
import { CategorySelector } from './CategorySelector';
import FileUploadProgress from './FileUploadProgress';
import { Category } from '@/types/fileTypes';
import { useFileUploadHandler } from './FileUploadHandler';

interface StandaloneDropUploaderProps {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;  
  availableCategories: Category[];
}

export const StandaloneDropUploader: React.FC<StandaloneDropUploaderProps> = ({
  creatorId,
  onUploadComplete,
  onCancel,
  currentFolder,
  availableCategories
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Get the upload handler
  const {
    isUploading,
    fileStatuses,
    overallProgress,
    handleFileChange,
    handleCancelUpload,
    MAX_FILE_SIZE_GB
  } = useFileUploadHandler({
    creatorId,
    currentFolder,
    onUploadComplete,
    availableCategories
  });

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    // Create a synthetic event object with the files
    const syntheticEvent = {
      target: { files: acceptedFiles },
      zipCategoryId: selectedCategoryId
    } as unknown as React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string | null };
    
    handleFileChange(syntheticEvent);
  }, [handleFileChange, selectedCategoryId]);

  const handleComplete = () => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Category selection for ZIP files */}
      <div className="mb-4">
        <CategorySelector 
          categories={availableCategories} 
          selectedCategoryId={selectedCategoryId} 
          onCategoryChange={setSelectedCategoryId} 
          label="When uploading ZIP files, place files in category:"
        />
      </div>

      {/* Drop zone area */}
      <DropZone 
        onDrop={handleDrop}
        disabled={isUploading} 
        maxSize={MAX_FILE_SIZE_GB * 1024 * 1024 * 1024}
      />

      {/* Progress display */}
      {isUploading && fileStatuses.length > 0 && (
        <div className="border rounded-md p-4 mt-4 bg-background max-h-[250px] overflow-y-auto">
          <FileUploadProgress
            fileStatuses={fileStatuses}
            overallProgress={overallProgress}
            onClose={() => {}}
            onCancelUpload={handleCancelUpload}
            embedded={true}
          />
        </div>
      )}

      {/* Action buttons */}
      <UploadActions 
        onCancel={onCancel}
        onComplete={handleComplete}
        isUploading={isUploading}
      />
    </div>
  );
};
