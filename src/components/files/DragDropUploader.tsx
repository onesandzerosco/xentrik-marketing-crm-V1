
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getUniqueFileName } from '@/utils/fileUtils';
import { X } from 'lucide-react';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const DragDropUploader = ({ 
  creatorId, 
  onUploadComplete, 
  onCancel,
  currentFolder 
}: { 
  creatorId: string; 
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const calculateOverallProgress = useCallback(() => {
    if (uploadingFiles.length === 0) return 0;
    const totalProgress = uploadingFiles.reduce((sum, file) => sum + file.progress, 0);
    return totalProgress / uploadingFiles.length;
  }, [uploadingFiles]);

  const updateFileProgress = useCallback((file: File, progress: number) => {
    setUploadingFiles(prevFiles => {
      const updatedFiles = prevFiles.map(item => 
        item.file.name === file.name ? { ...item, progress } : item
      );
      
      return updatedFiles;
    });

    // Calculate overall progress
    setUploadingFiles(prevFiles => {
      setOverallProgress(calculateOverallProgress());
      return prevFiles;
    });
  }, [calculateOverallProgress]);

  const updateFileStatus = useCallback((file: File, status: 'uploading' | 'complete' | 'error', error?: string) => {
    setUploadingFiles(prevFiles => 
      prevFiles.map(item => 
        item.file.name === file.name ? { ...item, status, error } : item
      )
    );
  }, []);

  const handleUpload = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setIsUploading(true);
    setUploadingFiles(
      acceptedFiles.map(file => ({
        file,
        progress: 0,
        status: 'uploading'
      }))
    );
    setOverallProgress(0);
    
    const uploadedFileIds: string[] = [];

    try {
      for (const file of acceptedFiles) {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueSafeName = await getUniqueFileName(
          safeName, 
          currentFolder, 
          creatorId, 
          'raw_uploads',
          supabase
        );
        
        const filePath = `${creatorId}/${uniqueSafeName}`;
        
        // Custom upload with progress tracking
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            updateFileProgress(file, percentComplete);
          }
        });
        
        // Create a promise to track the XHR request
        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.onload = async function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              updateFileProgress(file, 100);
              updateFileStatus(file, 'complete');
              
              // Add folder reference
              let folderArray: string[] = [];
              if (currentFolder && currentFolder !== 'shared' && currentFolder !== 'unsorted') {
                folderArray = [currentFolder];
              }
              
              // Store metadata in media table
              const { data: mediaRecord, error: mediaError } = await supabase
                .from('media')
                .insert({
                  creator_id: creatorId,
                  bucket_key: filePath,
                  filename: uniqueSafeName,
                  mime: file.type,
                  file_size: file.size,
                  status: 'complete',
                  folders: folderArray
                })
                .select('id');
                
              if (mediaError) {
                updateFileStatus(file, 'error', 'Failed to create media record');
                reject(mediaError);
              } else if (mediaRecord && mediaRecord[0]) {
                uploadedFileIds.push(mediaRecord[0].id);
                resolve();
              } else {
                resolve();
              }
            } else {
              updateFileStatus(file, 'error', `Upload failed: ${xhr.statusText}`);
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          
          xhr.onerror = function() {
            updateFileStatus(file, 'error', 'Network error during upload');
            reject(new Error('Network error during upload'));
          };
        });
        
        // Get signed URL and upload
        const { data: signedUrlData } = await supabase.storage
          .from('raw_uploads')
          .createSignedUploadUrl(filePath);
          
        if (signedUrlData) {
          xhr.open('PUT', signedUrlData.signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
          
          try {
            await uploadPromise;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
          }
        }
      }

      const successfulUploads = uploadingFiles.filter(f => f.status === 'complete').length;
      if (successfulUploads > 0) {
        toast({
          title: successfulUploads > 1 
            ? `${successfulUploads} files uploaded` 
            : '1 file uploaded',
          description: `Successfully uploaded ${successfulUploads} files`,
        });
      }
      
      onUploadComplete(uploadedFileIds.length > 0 ? uploadedFileIds : undefined);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload the file(s)',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

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
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-3">
              {uploadingFiles.map((item) => (
                <div key={item.file.name} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="truncate max-w-[250px]" title={item.file.name}>
                      {item.file.name}
                    </span>
                    <span>{Math.round(item.progress)}%</span>
                  </div>
                  <Progress value={item.progress} className="h-1.5" />
                  {item.error && (
                    <p className="text-xs text-destructive mt-1">{item.error}</p>
                  )}
                </div>
              ))}
            </div>
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
