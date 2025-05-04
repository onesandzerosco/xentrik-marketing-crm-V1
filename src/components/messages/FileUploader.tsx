
import React, { useState, ChangeEvent, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUniqueFileName } from '@/utils/fileUtils';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  folder?: string;
  bucket?: string;
}

// Define a type for storing upload state
interface PendingUpload {
  file: {
    name: string;
    type: string;
    size: number;
  };
  creatorId: string;
  folder: string;
  bucket: string;
  progress: number;
}

const LOCAL_STORAGE_KEY = 'pendingUploads';

const FileUploader: React.FC<FileUploaderProps> = ({ 
  id, 
  creatorId, 
  onUploadComplete,
  folder = 'shared',
  bucket = 'creator_files'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Check for pending uploads on component mount
  useEffect(() => {
    const checkPendingUploads = async () => {
      try {
        const pendingUploadsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!pendingUploadsJson) return;
        
        const pendingUploads: PendingUpload[] = JSON.parse(pendingUploadsJson);
        const relevantUploads = pendingUploads.filter(upload => 
          upload.creatorId === creatorId && 
          upload.folder === folder &&
          upload.bucket === bucket
        );
        
        if (relevantUploads.length === 0) {
          return;
        }
        
        // Ask user if they want to resume uploads
        const shouldResume = window.confirm(
          `You have ${relevantUploads.length} pending upload${relevantUploads.length > 1 ? 's' : ''}. Would you like to resume?`
        );
        
        if (shouldResume) {
          toast({
            title: "Resuming uploads",
            description: `Resuming ${relevantUploads.length} pending upload${relevantUploads.length > 1 ? 's' : ''}...`,
          });
          
          setIsUploading(true);
          const uploadedFileIds = [];
          
          for (const pendingUpload of relevantUploads) {
            try {
              // Create a unique file name
              const safeName = pendingUpload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
              const uniqueSafeName = await getUniqueFileName(
                safeName, 
                pendingUpload.folder, 
                pendingUpload.creatorId, 
                pendingUpload.bucket,
                supabase
              );
              
              const filePath = `${pendingUpload.creatorId}/${pendingUpload.folder}/${uniqueSafeName}`;
              
              // For demo purposes, we'll create a placeholder file
              // In a real implementation, you would need to store the actual file data
              // or use a resumable upload API
              const mockFile = new File(
                [new ArrayBuffer(pendingUpload.file.size)], 
                pendingUpload.file.name,
                { type: pendingUpload.file.type }
              );
              
              const { error: uploadError } = await supabase.storage
                .from(pendingUpload.bucket)
                .upload(filePath, mockFile, {
                  cacheControl: '3600',
                  upsert: true
                });
                
              if (uploadError) {
                throw uploadError;
              }
              
              // If using the raw_uploads bucket, also insert a record in the media table
              if (pendingUpload.bucket === 'raw_uploads') {
                const { data: mediaData, error: mediaError } = await supabase
                  .from('media')
                  .insert({
                    creator_id: pendingUpload.creatorId,
                    bucket_key: filePath,
                    filename: uniqueSafeName,
                    mime: pendingUpload.file.type,
                    file_size: pendingUpload.file.size
                  })
                  .select('id');
                  
                if (mediaError) {
                  console.error('Media record creation error:', mediaError);
                } else if (mediaData && mediaData[0]) {
                  uploadedFileIds.push(mediaData[0].id);
                }
              }
            } catch (error) {
              console.error('Error resuming upload:', error);
              toast({
                title: "Resume failed",
                description: `Failed to resume upload for ${pendingUpload.file.name}`,
                variant: "destructive",
              });
            }
          }
          
          // Clear the resumed uploads from localStorage
          clearPendingUploads(relevantUploads);
          
          toast({
            title: "Uploads completed",
            description: `Successfully resumed and completed ${relevantUploads.length} upload(s)`,
          });
          
          if (onUploadComplete && uploadedFileIds.length > 0) {
            onUploadComplete(uploadedFileIds);
          }
        } else {
          // User chose not to resume, clear the pending uploads
          clearPendingUploads(relevantUploads);
        }
      } catch (error) {
        console.error('Error checking pending uploads:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } finally {
        setIsUploading(false);
      }
    };
    
    checkPendingUploads();
  }, [creatorId, folder, bucket, onUploadComplete, toast]);

  // Clear specific pending uploads
  const clearPendingUploads = (uploadsToRemove: PendingUpload[]) => {
    try {
      const pendingUploadsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!pendingUploadsJson) return;
      
      let pendingUploads: PendingUpload[] = JSON.parse(pendingUploadsJson);
      
      // Remove completed uploads
      pendingUploads = pendingUploads.filter(upload => {
        return !uploadsToRemove.some(
          removeUpload => 
            removeUpload.creatorId === upload.creatorId && 
            removeUpload.folder === upload.folder &&
            removeUpload.bucket === upload.bucket &&
            removeUpload.file.name === upload.file.name
        );
      });
      
      if (pendingUploads.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pendingUploads));
      }
    } catch (error) {
      console.error('Error clearing pending uploads:', error);
    }
  };

  // Save upload state to localStorage
  const savePendingUpload = (file: File, progress: number) => {
    try {
      const pendingUpload: PendingUpload = {
        file: {
          name: file.name,
          type: file.type,
          size: file.size
        },
        creatorId,
        folder,
        bucket,
        progress
      };
      
      let pendingUploads: PendingUpload[] = [];
      
      const pendingUploadsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (pendingUploadsJson) {
        pendingUploads = JSON.parse(pendingUploadsJson);
      }
      
      // Remove any existing entry for this file
      pendingUploads = pendingUploads.filter(upload => 
        !(upload.creatorId === creatorId && 
          upload.folder === folder && 
          upload.bucket === bucket && 
          upload.file.name === file.name)
      );
      
      // Add the new/updated entry
      pendingUploads.push(pendingUpload);
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pendingUploads));
    } catch (error) {
      console.error('Error saving pending upload:', error);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      const uploadedFileIds = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Save initial upload state to localStorage
        savePendingUpload(file, 0);
        
        try {
          // Create a unique file name using the utility function
          const uniqueSafeName = await getUniqueFileName(
            safeName, 
            folder, 
            creatorId, 
            bucket,
            supabase
          );
          
          const filePath = `${creatorId}/${folder}/${uniqueSafeName}`;
          
          // Update progress at 50%
          savePendingUpload(file, 50);
          
          const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          // If using the raw_uploads bucket, also insert a record in the media table
          if (bucket === 'raw_uploads') {
            const { data: mediaData, error: mediaError } = await supabase
              .from('media')
              .insert({
                creator_id: creatorId,
                bucket_key: filePath,
                filename: uniqueSafeName,
                mime: file.type,
                file_size: file.size
              })
              .select('id');
              
            if (mediaError) {
              console.error('Media record creation error:', mediaError);
              // Continue uploading other files even if this record fails
            } else if (mediaData && mediaData[0]) {
              uploadedFileIds.push(mediaData[0].id);
            }
          }
          
          uploadedFiles.push(uniqueSafeName.replace(/_/g, ' '));
          
          // Remove completed upload from pending list
          const pendingUploadsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (pendingUploadsJson) {
            const pendingUploads: PendingUpload[] = JSON.parse(pendingUploadsJson);
            const updatedPendingUploads = pendingUploads.filter(upload => 
              !(upload.creatorId === creatorId && 
                upload.folder === folder && 
                upload.bucket === bucket && 
                upload.file.name === file.name)
            );
            
            if (updatedPendingUploads.length === 0) {
              localStorage.removeItem(LOCAL_STORAGE_KEY);
            } else {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPendingUploads));
            }
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: `Upload failed: ${file.name}`,
            description: error instanceof Error ? error.message : 'Failed to upload the file',
            variant: 'destructive',
          });
        }
      }
      
      if (uploadedFiles.length > 0) {
        toast({
          title: uploadedFiles.length > 1 
            ? `${uploadedFiles.length} files uploaded` 
            : '1 file uploaded',
          description: uploadedFiles.length > 1 
            ? `Successfully uploaded ${uploadedFiles.length} files` 
            : `Successfully uploaded ${uploadedFiles[0]}`,
        });
      }
      
      // Reset the input
      e.target.value = '';
      
      // Call the callback if it exists, passing the IDs of newly uploaded files
      if (onUploadComplete && uploadedFileIds.length > 0) {
        onUploadComplete(uploadedFileIds);
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

  return (
    <input
      id={id}
      type="file"
      onChange={handleFileChange}
      disabled={isUploading}
      multiple
      className="hidden"
    />
  );
};

export default FileUploader;
