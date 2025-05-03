
import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { v4 as uuidv4 } from 'uuid';
import { getUniqueFileName } from '@/utils/fileUtils';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

interface DragDropUploaderProps {
  creatorId: string;
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder?: string;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({
  creatorId,
  onUploadComplete,
  onCancel,
  currentFolder = 'shared'
}) => {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: uuidv4(),
      file,
      progress: 0,
      status: 'uploading' as const
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024, // 100MB
  });
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedIds: string[] = [];
    
    for (const fileObj of files) {
      if (fileObj.status !== 'uploading') continue;
      
      try {
        const file = fileObj.file;
        const fileId = fileObj.id;
        
        // Create a unique filename to avoid collisions
        const uniqueFileName = await getUniqueFileName(
          file.name, 
          currentFolder, 
          creatorId, 
          'creator_files',
          supabase
        );
        
        // Upload to storage
        const { error: uploadError, data } = await supabase.storage
          .from('creator_files')
          .upload(`${creatorId}/${currentFolder}/${uniqueFileName}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Also create an entry in the media table
        const { error: mediaError, data: mediaData } = await supabase
          .from('media')
          .insert({
            id: fileId,
            creator_id: creatorId,
            filename: uniqueFileName,
            bucket_key: `${creatorId}/${currentFolder}/${uniqueFileName}`,
            file_size: file.size,
            mime: file.type,
            status: 'complete'
          })
          .select('id')
          .single();
        
        if (mediaError) {
          console.error('Error creating media record:', mediaError);
        } else {
          uploadedIds.push(mediaData.id);
        }
        
        // Update file status
        setFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'complete', progress: 100 }
              : f
          )
        );
      } catch (error: any) {
        console.error('Upload error:', error);
        
        // Update file status with error
        setFiles(prev =>
          prev.map(f =>
            f.id === fileObj.id
              ? { ...f, status: 'error', error: error.message || 'Upload failed' }
              : f
          )
        );
        
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${fileObj.file.name}: ${error.message || 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    }
    
    setIsUploading(false);
    
    // Check if all files are processed
    const allComplete = files.every(f => f.status === 'complete' || f.status === 'error');
    const successCount = files.filter(f => f.status === 'complete').length;
    
    if (allComplete) {
      toast({
        title: 'Upload complete',
        description: `Successfully uploaded ${successCount} of ${files.length} files`,
      });
      
      // Call the onUploadComplete callback with the IDs of the uploaded files
      onUploadComplete(uploadedIds);
    }
  };
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };
  
  // Upload files automatically when they are added
  useEffect(() => {
    if (files.length > 0 && !isUploading) {
      uploadFiles();
    }
  }, [files]);
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upload Files to {currentFolder}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
            } ${files.length > 0 ? 'mb-4' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground">
                  Drag 'n' drop files here, or click to select files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 100MB
                </p>
              </div>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="space-y-3 mt-4 max-h-72 overflow-y-auto">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 border rounded-md p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Progress 
                      value={file.progress} 
                      className={`h-1 mt-1 ${file.status === 'error' ? 'bg-destructive/25' : ''}`} 
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {file.status === 'complete' ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : file.status === 'error' ? (
                      <div title={file.error || 'Error'}>
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                      disabled={isUploading && file.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Close
          </Button>
          <Button onClick={uploadFiles} disabled={isUploading || files.length === 0}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DragDropUploader;
