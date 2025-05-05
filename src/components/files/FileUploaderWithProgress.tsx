
import React, { useState, ChangeEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { isVideoFile, isFileTooLarge } from '@/utils/fileUtils';
import { isZipFile } from '@/utils/zipUtils';
import { useFileUploader, FileUploadStatus } from '@/hooks/useFileUploader';
import { useZipFileProcessor } from '@/hooks/useZipFileProcessor';
import { useFileProcessor } from '@/hooks/useFileProcessor';
import FileUploadProgress from './upload/FileUploadProgress';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  currentFolder: string;
}

const FileUploaderWithProgress: React.FC<FileUploaderProps> = ({ 
  id, 
  creatorId, 
  onUploadComplete,
  currentFolder
}) => {
  const { toast } = useToast();
  const {
    isUploading,
    setIsUploading,
    fileStatuses,
    setFileStatuses,
    overallProgress,
    showProgress,
    setShowProgress,
    abortControllersRef,
    updateFileProgress,
    handleCancelUpload,
    MAX_FILE_SIZE_GB,
    CHUNK_SIZE
  } = useFileUploader({ 
    creatorId, 
    onUploadComplete, 
    currentFolder 
  });

  const { processZipFile } = useZipFileProcessor({
    creatorId,
    updateFileProgress,
    setFileStatuses
  });

  const { processRegularFile } = useFileProcessor({
    creatorId,
    currentFolder,
    updateFileProgress,
    setFileStatuses,
    chunkSize: CHUNK_SIZE,
    maxFileSizeGB: MAX_FILE_SIZE_GB,
    abortControllersRef
  });

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
      let hasZipFiles = false;
      const zipFiles: File[] = [];
      const regularFiles: File[] = [];
      
      // First pass: prepare file statuses and check sizes and types
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is a ZIP file
        if (isZipFile(file.name)) {
          hasZipFiles = true;
          zipFiles.push(file);
          initialStatuses.push({
            name: file.name,
            progress: 0,
            status: 'processing'
          });
          continue;
        }
        
        regularFiles.push(file);
        
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
      
      if (initialStatuses.length === 0) {
        setIsUploading(false);
        e.target.value = '';
        return;
      }
      
      // Show toasts for special file types
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
      
      if (hasZipFiles) {
        toast({
          title: "ZIP files detected",
          description: "ZIP files will be unpacked automatically into a new folder.",
        });
      }
      
      const uploadedFileIds: string[] = [];

      // First handle the ZIP files
      for (const zipFile of zipFiles) {
        const extractedFileIds = await processZipFile(zipFile);
        uploadedFileIds.push(...extractedFileIds);
        
        // Add the newly created folder to available folders list (will be picked up on refresh)
        const folderName = zipFile.name.split('.')[0];
        toast({
          title: "ZIP file processed",
          description: `Created folder "${folderName}" with ${extractedFileIds.length} files`,
        });
      }
      
      // Process regular files sequentially to avoid overwhelming the API
      for (const file of regularFiles) {
        // Skip files that are too large (already warned)
        if (isFileTooLarge(file, MAX_FILE_SIZE_GB)) continue;
        
        const fileId = await processRegularFile(file);
        if (fileId) {
          uploadedFileIds.push(fileId);
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

  return (
    <>
      <input
        id={id}
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip"
      />
      
      {/* Progress display overlay */}
      {showProgress && 
        <FileUploadProgress 
          fileStatuses={fileStatuses} 
          overallProgress={overallProgress} 
          onClose={() => setShowProgress(false)}
          onCancelUpload={handleCancelUpload}
        />
      }
    </>
  );
};

export default FileUploaderWithProgress;
