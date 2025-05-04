
import React, { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUniqueFileName } from '@/utils/fileUtils';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}

interface FileUploadStatus {
  name: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const FileUploaderWithProgress: React.FC<FileUploaderProps> = ({ 
  id, 
  creatorId, 
  onUploadComplete,
  currentFolder
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const { toast } = useToast();
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const calculateOverallProgress = (statuses: FileUploadStatus[]) => {
    if (statuses.length === 0) return 0;
    const totalProgress = statuses.reduce((sum, file) => sum + file.progress, 0);
    return totalProgress / statuses.length;
  };

  const updateFileProgress = (fileName: string, progress: number) => {
    setFileStatuses(prevStatuses => {
      const updatedStatuses = prevStatuses.map(status => 
        status.name === fileName ? { ...status, progress } : status
      );
      
      // Calculate and update overall progress
      const newOverallProgress = calculateOverallProgress(updatedStatuses);
      setOverallProgress(newOverallProgress);
      
      return updatedStatuses;
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setShowProgress(true);
    setFileStatuses([]);
    abortControllersRef.current.clear();
    
    // Initialize file statuses
    const initialStatuses: FileUploadStatus[] = Array.from(files).map(file => ({
      name: file.name,
      progress: 0,
      status: 'uploading'
    }));
    setFileStatuses(initialStatuses);
    setOverallProgress(0);
    
    try {
      const uploadedFileIds: string[] = [];
      
      // Process files sequentially to avoid overwhelming the API
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Create a unique file name
        const uniqueSafeName = await getUniqueFileName(
          safeName, 
          currentFolder, 
          creatorId, 
          'raw_uploads',
          supabase
        );

        // Create an AbortController for this file
        const abortController = new AbortController();
        abortControllersRef.current.set(file.name, abortController);
        
        const filePath = `${creatorId}/${uniqueSafeName}`;
        
        // Custom upload with progress tracking
        const xhr = new XMLHttpRequest();
        
        // Setup progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            updateFileProgress(file.name, percentComplete);
          }
        });
        
        // Create a promise to track the XHR request
        const uploadPromise = new Promise<void>((resolve, reject) => {
          xhr.onload = async function() {
            if (xhr.status >= 200 && xhr.status < 300) {
              // Update file status to complete
              setFileStatuses(prev => 
                prev.map(status => 
                  status.name === file.name 
                    ? { ...status, status: 'complete', progress: 100 } 
                    : status
                )
              );
              
              // Add folder reference
              let folderArray: string[] = [];
              if (currentFolder && currentFolder !== 'shared' && currentFolder !== 'unsorted') {
                folderArray = [currentFolder];
              }
              
              // Store metadata in the media table
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
                console.error('Media record creation error:', mediaError);
                setFileStatuses(prev => 
                  prev.map(status => 
                    status.name === file.name 
                      ? { ...status, status: 'error', error: 'Failed to create media record' } 
                      : status
                  )
                );
                reject(mediaError);
              } else if (mediaRecord && mediaRecord[0]) {
                uploadedFileIds.push(mediaRecord[0].id);
                resolve();
              } else {
                resolve();
              }
            } else {
              setFileStatuses(prev => 
                prev.map(status => 
                  status.name === file.name 
                    ? { ...status, status: 'error', error: `Upload failed: ${xhr.statusText}` } 
                    : status
                )
              );
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          };
          
          xhr.onerror = function() {
            setFileStatuses(prev => 
              prev.map(status => 
                status.name === file.name 
                  ? { ...status, status: 'error', error: 'Network error during upload' } 
                  : status
              )
            );
            reject(new Error('Network error during upload'));
          };
          
          xhr.onabort = function() {
            setFileStatuses(prev => 
              prev.map(status => 
                status.name === file.name 
                  ? { ...status, status: 'error', error: 'Upload cancelled' } 
                  : status
              )
            );
            reject(new Error('Upload cancelled'));
          };
        });
        
        // Get the presigned URL for the upload
        const { data: signedUrlData } = await supabase.storage
          .from('raw_uploads')
          .createSignedUploadUrl(filePath);
        
        if (signedUrlData) {
          // Configure the XHR request
          xhr.open('PUT', signedUrlData.signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
          
          try {
            await uploadPromise;
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            // Continue with other files even if this one failed
          }
        }
      }
      
      // Show success message only for successful uploads
      const successfulUploads = fileStatuses.filter(f => f.status === 'complete').length;
      if (successfulUploads > 0) {
        toast({
          title: successfulUploads > 1 
            ? `${successfulUploads} files uploaded` 
            : '1 file uploaded',
          description: `Successfully uploaded ${successfulUploads} files`,
        });
      }
      
      // Reset the input
      e.target.value = '';
      
      // Call the callback if it exists
      if (onUploadComplete && uploadedFileIds.length > 0) {
        onUploadComplete(uploadedFileIds);
        
        // Hide progress after a delay
        setTimeout(() => {
          setShowProgress(false);
        }, 3000);
      }
      
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

  const handleCancelUpload = (fileName: string) => {
    const controller = abortControllersRef.current.get(fileName);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileName);
    }
    
    setFileStatuses(prev => 
      prev.filter(status => status.name !== fileName)
    );
    
    // Recalculate overall progress
    setFileStatuses(prev => {
      const newOverallProgress = calculateOverallProgress(prev);
      setOverallProgress(newOverallProgress);
      return prev;
    });
  };

  return (
    <>
      <input
        id={id}
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        multiple
        className="hidden"
      />
      
      {/* Progress display overlay */}
      {showProgress && fileStatuses.length > 0 && (
        <div className="fixed bottom-5 right-5 bg-background border border-border rounded-md shadow-lg p-4 w-80 z-50">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Uploading Files</h3>
            <button 
              onClick={() => setShowProgress(false)} 
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close upload progress"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Overall progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
          
          <div className="max-h-40 overflow-y-auto space-y-3">
            {fileStatuses.map((file) => (
              <div key={file.name} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="truncate max-w-[180px]" title={file.name}>{file.name}</span>
                  <span>{Math.round(file.progress)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={file.progress} className="h-1.5 flex-grow" />
                  {file.status === 'uploading' && (
                    <button 
                      onClick={() => handleCancelUpload(file.name)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Cancel upload"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {file.error && <p className="text-xs text-destructive mt-1">{file.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default FileUploaderWithProgress;
