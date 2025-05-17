
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { X, FileVideo } from 'lucide-react';
import { FileUploadStatus } from '@/hooks/useFileUploader';
import { isVideoFile } from '@/utils/fileUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileUploadProgressProps {
  fileStatuses: FileUploadStatus[];
  overallProgress: number;
  onClose: () => void;
  onCancelUpload: (fileName: string) => void;
  embedded?: boolean; // Added embedded prop as optional
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileStatuses,
  overallProgress,
  onClose,
  onCancelUpload,
  embedded = false // Default to false
}) => {
  if (fileStatuses.length === 0) {
    return null;
  }

  // If embedded is true, render a simpler version without the fixed positioning
  return (
    <div className={`${embedded ? '' : 'fixed bottom-5 right-5'} bg-background border border-border rounded-md shadow-lg p-4 ${embedded ? 'w-full' : 'w-80'} z-50 flex flex-col`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Uploading Files</h3>
        <button 
          onClick={onClose} 
          className="text-muted-foreground hover:text-foreground"
          aria-label="Close upload progress"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Overall progress</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>
      
      <ScrollArea className="max-h-60 flex-grow">
        <div className="space-y-3">
          {fileStatuses.map((file) => (
            <div key={file.name} className="text-sm">
              <div className="flex justify-between mb-1">
                <div className="flex items-center gap-2">
                  {file.thumbnail && (
                    <div className="h-6 w-6 rounded overflow-hidden bg-black flex-shrink-0">
                      <img src={file.thumbnail} alt="Video thumbnail" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {!file.thumbnail && isVideoFile(file.name) && (
                    <FileVideo size={16} className="text-muted-foreground" />
                  )}
                  <span className="truncate max-w-[140px]" title={file.name}>{file.name}</span>
                </div>
                <span>{Math.round(file.progress)}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={file.progress} 
                  className={`h-1.5 flex-grow ${
                    file.status === 'error' ? 'bg-red-200' : 
                    file.status === 'processing' ? 'bg-yellow-200' : ''
                  }`}
                />
                {file.status === 'uploading' && (
                  <button 
                    onClick={() => onCancelUpload(file.name)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Cancel upload"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              {file.status === 'processing' && (
                <p className="text-xs text-amber-500 mt-1">Processing file...</p>
              )}
              {file.error && <p className="text-xs text-destructive mt-1">{file.error}</p>}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FileUploadProgress;
