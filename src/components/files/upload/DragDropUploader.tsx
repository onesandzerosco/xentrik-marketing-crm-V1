
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useDragDropUploader } from '@/hooks/useDragDropUploader';
import UploadingFilesList from './UploadingFilesList';
import OverallProgressIndicator from './OverallProgressIndicator';

interface DragDropUploaderProps { 
  creatorId: string; 
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ 
  creatorId, 
  onUploadComplete, 
  onCancel,
  currentFolder 
}) => {
  const {
    handleUpload,
    isUploading,
    uploadingFiles,
    overallProgress
  } = useDragDropUploader({ creatorId, onUploadComplete, currentFolder });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'application/zip': [],
    },
    disabled: isUploading,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Upload Files</h2>
        </div>
        
        <div {...getRootProps()} className="border-dashed border-2 border-gray-300 p-8 m-4 text-center bg-muted/30 rounded-lg">
          <input {...getInputProps()} />
          {!isUploading ? (
            <p>Drag & drop some files here, or click to select files</p>
          ) : (
            <p>Uploading... please wait</p>
          )}
        </div>
        
        {uploadingFiles.length > 0 && (
          <div className="px-4 pb-4">
            <OverallProgressIndicator 
              progress={overallProgress} 
            />
            
            <UploadingFilesList 
              files={uploadingFiles} 
            />
          </div>
        )}
        
        <div className="p-4 border-t flex justify-end">
          <Button 
            onClick={onCancel} 
            variant="outline" 
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Cancel"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DragDropUploader;
