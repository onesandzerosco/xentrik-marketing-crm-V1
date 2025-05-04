
import React, { useState, useRef, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  getUniqueFileName,
  isVideoFile, 
  generateVideoThumbnail,
  uploadFileInChunks,
  isFileTooLarge
} from '@/utils/fileUtils';
import { Progress } from '@/components/ui/progress';
import { X, FileVideo } from 'lucide-react';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}

interface FileUploadStatus {
  name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  thumbnail?: string; // For video files
}

// Maximum file size in GB
const MAX_FILE_SIZE_GB = 1;
// 10MB chunks for large files
const CHUNK_SIZE = 10 * 1024 * 1024;

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

  const updateFileProgress = (fileName: string, progress: number, status?: 'uploading' | 'processing' | 'complete' | 'error') => {
    setFileStatuses(prevStatuses => {
      const updatedStatuses = prevStatuses.map(fileStatus => {
        if (fileStatus.name === fileName) {
          return { 
            ...fileStatus, 
            progress,
            status: status || fileStatus.status
          };
        }
        return fileStatus;
      });
      
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
    
    try {
      // Initialize file statuses and check for large files
      const initialStatuses: FileUploadStatus[] = [];
      let hasLargeFiles = false;
      let hasTooLargeFiles = false;
      
      // First pass: prepare file statuses and check sizes
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is too large (over 1GB)
        if (isFileTooLarge(file, MAX_FILE_SIZE_GB)) {
          toast({
            title: "File too large",
            description: `${file.name} is over ${MAX_FILE_SIZE_GB}GB which exceeds the maximum file size limit.`,
            variant: "destructive",
          });
          hasTooLargeFiles = true;
          continue;
        }
        
        if (file.size > CHUNK_SIZE) {
          hasLargeFiles = true;
        }
        
        initialStatuses.push({
          name: file.name,
          progress: 0,
          status: 'uploading'
        });
      }
      
      setFileStatuses(initialStatuses);
      setOverallProgress(0);
      
      if (initialStatuses.length === 0) {
        setIsUploading(false);
        e.target.value = '';
        return;
      }
      
      if (hasLargeFiles) {
        toast({
          title: "Large files detected",
          description: "Some files are large and will be uploaded in chunks. This may take a while.",
        });
      }
      
      if (hasTooLargeFiles && initialStatuses.length > 0) {
        toast({
          title: "Some files were skipped",
          description: `Files larger than ${MAX_FILE_SIZE_GB}GB were skipped.`,
        });
      }
      
      const uploadedFileIds: string[] = [];
      
      // Process files sequentially to avoid overwhelming the API
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Skip files that are too large (already warned)
        if (isFileTooLarge(file, MAX_FILE_SIZE_GB)) continue;
        
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        try {
          // Generate thumbnail for videos
          let thumbnailUrl = null;
          if (isVideoFile(file.name)) {
            updateFileProgress(file.name, 0, 'processing');
            try {
              thumbnailUrl = await generateVideoThumbnail(file);
              // Update the UI with the thumbnail
              setFileStatuses(prev => 
                prev.map(status => 
                  status.name === file.name 
                    ? { ...status, thumbnail: thumbnailUrl, status: 'uploading' } 
                    : status
                )
              );
            } catch (err) {
              console.error('Error generating video thumbnail:', err);
              // Continue without thumbnail
            }
          }
          
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
          
          const filePath = `${creatorId}/${currentFolder}/${uniqueSafeName}`;
          
          // Add folder reference
          let folderArray: string[] = [];
          if (currentFolder && currentFolder !== 'shared' && currentFolder !== 'unsorted') {
            folderArray = [currentFolder];
          }
          
          // Store metadata in the media table first
          const { data: mediaRecord, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueSafeName,
              mime: file.type,
              file_size: file.size,
              status: 'uploading', // Mark as uploading initially
              folders: folderArray
            })
            .select('id');
          
          if (mediaError) {
            console.error('Media record creation error:', mediaError);
            updateFileProgress(file.name, 0, 'error');
            continue;
          }
          
          if (!mediaRecord || mediaRecord.length === 0) {
            console.error('Failed to create media record');
            updateFileProgress(file.name, 0, 'error');
            continue;
          }
          
          const fileId = mediaRecord[0].id;
          
          try {
            if (file.size > CHUNK_SIZE) {
              // Handle large file upload using custom chunked upload
              await uploadFileInChunks(
                file, 
                'raw_uploads', 
                filePath,
                (progress) => updateFileProgress(file.name, progress),
                supabase
              );
            } else {
              // Use direct upload for small files
              const { error: uploadError } = await supabase.storage
                .from('raw_uploads')
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: true,
                  onUploadProgress: (progress) => {
                    const percentage = progress.percent ? progress.percent : 0;
                    updateFileProgress(file.name, percentage);
                  },
                });
                
              if (uploadError) {
                throw uploadError;
              }
            }
            
            // Update the media record to mark as complete
            await supabase
              .from('media')
              .update({ status: 'complete' })
              .eq('id', fileId);
            
            updateFileProgress(file.name, 100, 'complete');
            uploadedFileIds.push(fileId);
            
          } catch (error) {
            console.error(`Upload error for ${file.name}:`, error);
            
            // Update the media record to mark as failed
            await supabase
              .from('media')
              .update({ status: 'error' })
              .eq('id', fileId);
              
            updateFileProgress(file.name, 0, 'error');
            
            setFileStatuses(prev => 
              prev.map(status => 
                status.name === file.name 
                  ? { 
                      ...status, 
                      error: error instanceof Error ? error.message : 'Upload failed',
                      status: 'error'
                    } 
                  : status
              )
            );
          }
          
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          updateFileProgress(
            file.name, 
            0, 
            'error'
          );
          setFileStatuses(prev => 
            prev.map(status => 
              status.name === file.name 
                ? { ...status, error: error instanceof Error ? error.message : 'Upload failed' } 
                : status
            )
          );
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
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
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
          
          <div className="max-h-60 overflow-y-auto space-y-3">
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
                      onClick={() => handleCancelUpload(file.name)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Cancel upload"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                {file.status === 'processing' && (
                  <p className="text-xs text-amber-500 mt-1">Processing video...</p>
                )}
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
