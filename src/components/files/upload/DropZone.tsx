
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DropzoneOptions } from 'react-dropzone';

interface DropZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  disabled?: boolean;
  accept?: Record<string, string[]>;
  maxSize?: number;
  isDragActive?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  onDrop, 
  disabled = false, 
  accept,
  maxSize
}) => {
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    disabled,
    accept: accept || {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.mpg', '.mpeg', '.m4v'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'application/zip': ['.zip'], // Explicitly add ZIP file support
    },
    maxSize,
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  return (
    <div 
      {...getRootProps()}
      className={`
        flex-1 border-2 border-dashed rounded-lg p-6 cursor-pointer 
        flex flex-col items-center justify-center text-center transition-all
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20'}
        ${disabled ? 'pointer-events-none opacity-60' : 'hover:border-primary/50 hover:bg-muted/20'}
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
            Supports: Images, Videos, Audio, Documents, ZIP files
          </div>
          {maxSize && (
            <div className="text-xs text-muted-foreground mt-2">
              Max file size: {Math.round(maxSize / (1024 * 1024 * 1024))}GB
            </div>
          )}
        </div>
      )}
    </div>
  );
};
