
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { UploadingFile, FileUploadOptions } from '@/types/uploadTypes';
import { isZipFile } from '@/utils/zipUtils';
import { supabase } from '@/integrations/supabase/client';
import { getUniqueFileName } from '@/utils/fileUtils';

export const useDragDropUploader = ({ 
  creatorId, 
  onUploadComplete, 
  currentFolder 
}: FileUploadOptions) => {
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

  const updateFileStatus = useCallback((file: File, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => {
    setUploadingFiles(prevFiles => 
      prevFiles.map(item => 
        item.file.name === file.name ? { ...item, status, error } : item
      )
    );
  }, []);

  const processZipFile = async (file: File): Promise<string[]> => {
    updateFileStatus(file, 'processing');
    updateFileProgress(file, 10);
    
    // Get the base name for folder creation (without .zip extension)
    const folderName = file.name.replace(/\.zip$/i, '');
    const uploadedFileIds: string[] = [];
    
    try {
      // Call the Edge Function to extract the ZIP file
      updateFileProgress(file, 30);
      
      // Get signed URL for the zip file upload
      const { data: signedUrlData } = await supabase.storage
        .from('raw_uploads')
        .createSignedUploadUrl(`${creatorId}/${file.name}`);
          
      if (!signedUrlData) {
        throw new Error('Failed to get signed URL for ZIP upload');
      }

      // Upload ZIP file to temporary storage
      const uploadResponse = await fetch(signedUrlData.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload ZIP file');
      }
      
      updateFileProgress(file, 50);
      
      // Call the unzip-files Edge Function
      const { data: extractionData, error: extractionError } = await supabase.functions.invoke('unzip-files', {
        body: {
          creatorId,
          fileName: file.name,
          targetFolder: folderName,
          currentFolder: currentFolder === 'all' || currentFolder === 'unsorted' ? null : currentFolder
        }
      });
      
      if (extractionError) {
        throw new Error(`ZIP extraction failed: ${extractionError.message}`);
      }
      
      updateFileProgress(file, 90);
      
      // Add extracted file IDs to the result
      if (extractionData?.fileIds && Array.isArray(extractionData.fileIds)) {
        uploadedFileIds.push(...extractionData.fileIds);
        
        // Show success message for ZIP extraction
        toast({
          title: "ZIP file processed",
          description: `Created folder "${folderName}" with ${extractionData.fileIds.length} files`,
        });
      }
      
      updateFileProgress(file, 100);
      updateFileStatus(file, 'complete');
      return uploadedFileIds;
    } catch (zipError) {
      console.error("Error processing ZIP file:", zipError);
      updateFileStatus(file, 'error', zipError instanceof Error ? zipError.message : 'Failed to process ZIP file');
      return [];
    }
  };

  const processRegularFile = async (file: File): Promise<string | null> => {
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
    const uploadPromise = new Promise<string | null>((resolve, reject) => {
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
            return null;
          } else if (mediaRecord && mediaRecord[0]) {
            resolve(mediaRecord[0].id);
            return mediaRecord[0].id;
          } else {
            resolve(null);
            return null;
          }
        } else {
          updateFileStatus(file, 'error', `Upload failed: ${xhr.statusText}`);
          reject(new Error(`Upload failed: ${xhr.statusText}`));
          return null;
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
        return await uploadPromise;
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        return null;
      }
    }
    
    return null;
  };

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
      // Process files by type (ZIP vs regular)
      for (const file of acceptedFiles) {
        if (isZipFile(file.name)) {
          const extractedFileIds = await processZipFile(file);
          uploadedFileIds.push(...extractedFileIds);
          continue;
        }
        
        // Regular file upload (non-ZIP)
        const fileId = await processRegularFile(file);
        if (fileId) {
          uploadedFileIds.push(fileId);
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
      
      if (onUploadComplete) {
        onUploadComplete(uploadedFileIds.length > 0 ? uploadedFileIds : undefined);
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

  return {
    isUploading,
    uploadingFiles,
    overallProgress,
    updateFileProgress,
    updateFileStatus,
    handleUpload
  };
};
