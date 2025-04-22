
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  creatorId: string;
  folderPath?: string;
  onUploadComplete?: () => void;
}

interface UploadProgressEvent {
  loaded: number;
  total: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ creatorId, folderPath = '', onUploadComplete }) => {
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
  const [uploading, setUploading] = React.useState(false);

  const uploadFile = async (file: File) => {
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${creatorId}${folderPath ? '/' + folderPath : ''}/${safeName}`;
      
      // Create a new progress tracker
      const fileId = file.name;
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: 0
      }));
      
      // Use the upload method without progress event
      const { data, error } = await supabase.storage
        .from('creator_files')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      // Simulate progress (since we can't track it directly)
      // This is a fallback approach - in a real app, we'd use XHR
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: 100
      }));

      if (error) throw error;
      
      return path;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      await Promise.all(acceptedFiles.map(uploadFile));
      onUploadComplete?.();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [creatorId, folderPath, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the files here'
              : 'Drag and drop files here, or click to select files'}
          </p>
        </div>
      </div>

      {Object.entries(uploadProgress).map(([fileName, progress]) => (
        <div key={fileName} className="space-y-2">
          <div className="flex items-center gap-2">
            <File className="h-4 w-4" />
            <span className="text-sm truncate flex-1">{fileName}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      ))}

      {uploading && (
        <Button disabled className="w-full">
          Uploading...
        </Button>
      )}
    </div>
  );
};

export default FileUploader;
