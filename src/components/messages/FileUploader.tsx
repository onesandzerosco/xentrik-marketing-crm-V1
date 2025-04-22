
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  creatorId: string;
  folderPath?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ creatorId, folderPath = 'shared' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        const fileId = file.name;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${creatorId}/${folderPath}/${safeName}`;
        
        await supabase.storage
          .from('creator_files')
          .upload(path, file, {
            cacheControl: '3600',
            upsert: true
          });

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
      }
      
      toast({
        title: "Files uploaded successfully",
        description: "Your files have been shared successfully",
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true
  });

  return (
    <div className="p-6 border border-border rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
      
      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200 ease-in-out 
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
            </p>
          </div>
        </div>

        {/* Progress indicators */}
        {Object.entries(uploadProgress).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Uploading Files</h3>
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
          </div>
        )}

        {isUploading && (
          <Button disabled className="w-full">
            Uploading...
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileUploader;
