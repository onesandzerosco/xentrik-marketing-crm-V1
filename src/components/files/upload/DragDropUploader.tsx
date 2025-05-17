
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { FileUploadStatus } from '@/hooks/useFileUploader';
import FileUploadProgress from './FileUploadProgress';
import { Category } from '@/types/fileTypes';
import { useFileUploadHandler } from './FileUploadHandler';
import { CategorySelector } from './CategorySelector'; // Fixed import to use named import

interface DragDropUploaderProps {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;  
  availableCategories: Category[];
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({
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

  // Setup drop zone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Create a synthetic event object with the files
    const syntheticEvent = {
      target: { files: acceptedFiles },
      zipCategoryId: selectedCategoryId
    } as unknown as React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string };
    
    handleFileChange(syntheticEvent);
  }, [handleFileChange, selectedCategoryId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading
  });

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
      <div 
        {...getRootProps()}
        className={`
          flex-1 border-2 border-dashed rounded-lg p-6 cursor-pointer 
          flex flex-col items-center justify-center text-center transition-all
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
          ${isUploading ? 'pointer-events-none opacity-60' : 'hover:border-primary/50 hover:bg-muted/20'}
        `}
      >
        <input {...getInputProps()} />
        
        {isDragActive ? (
          <div className="text-lg font-medium text-primary">Drop files here...</div>
        ) : (
          <div className="space-y-2">
            <div className="text-lg font-medium">Drag & drop files here</div>
            <div className="text-sm text-muted-foreground">Or click to select files</div>
            <div className="text-xs text-muted-foreground mt-2">
              Max file size: {MAX_FILE_SIZE_GB}GB
            </div>
          </div>
        )}
      </div>

      {/* Progress display */}
      {isUploading && fileStatuses.length > 0 && (
        <div className="border rounded-md p-4 mt-4 bg-background max-h-[250px] overflow-y-auto">
          <FileUploadProgress
            fileStatuses={fileStatuses}
            overallProgress={overallProgress}
            onClose={() => {}}
            onCancelUpload={handleCancelUpload}
            embedded={true} // This prop is now defined in the component interface
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-between pt-4 border-t mt-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          variant="default" 
          onClick={() => onUploadComplete && onUploadComplete()}
          disabled={isUploading}
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default DragDropUploader;
