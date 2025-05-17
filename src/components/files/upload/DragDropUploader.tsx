
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getUniqueFileName } from '@/utils/fileUtils';
import { X, Upload } from 'lucide-react';
import { isZipFile } from '@/utils/zipUtils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/fileTypes';

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface DragDropUploaderProps {
  creatorId: string; 
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;
  availableCategories: Category[];
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({ 
  creatorId, 
  onUploadComplete, 
  onCancel,
  currentFolder,
  availableCategories
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [selectedZipFiles, setSelectedZipFiles] = useState<File[]>([]);
  const [selectedZipCategory, setSelectedZipCategory] = useState<string>('');
  const [showZipCategorySelector, setShowZipCategorySelector] = useState(false);

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

  // Check if there are any ZIP files in the selection
  const checkForZipFiles = (files: File[]): boolean => {
    return files.some(file => isZipFile(file.name));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Check if there are ZIP files in the selection
    const hasZipFiles = checkForZipFiles(acceptedFiles);
    
    if (hasZipFiles) {
      // Filter out ZIP files
      const zipFiles = acceptedFiles.filter(file => isZipFile(file.name));
      setSelectedZipFiles(zipFiles);
      setShowZipCategorySelector(true);
    } else {
      // No ZIP files, proceed with regular upload
      handleUpload(acceptedFiles);
    }
  }, []);

  const handleUpload = async (acceptedFiles: File[], zipCategoryId?: string) => {
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
          // Update status to processing for ZIP files
          updateFileStatus(file, 'processing');
          updateFileProgress(file, 10);
          
          // Get the base name for folder creation (without .zip extension)
          const folderName = file.name.replace(/\.zip$/i, '');
          
          try {
            // Check if category is provided for ZIP files
            if (!zipCategoryId) {
              toast({
                title: "Category required",
                description: "Please select a category for the ZIP file",
                variant: "destructive"
              });
              updateFileStatus(file, 'error', 'Category required for ZIP files');
              continue;
            }
            
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
            
            // Call the unzip-files Edge Function with the category ID
            const { data: extractionData, error: extractionError } = await supabase.functions.invoke('unzip-files', {
              body: {
                creatorId,
                fileName: file.name,
                targetFolder: folderName,
                currentFolder: currentFolder === 'all' || currentFolder === 'unsorted' ? null : currentFolder,
                categoryId: zipCategoryId // Pass the category ID
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
          } catch (zipError) {
            console.error("Error processing ZIP file:", zipError);
            updateFileStatus(file, 'error', zipError instanceof Error ? zipError.message : 'Failed to process ZIP file');
          }
          
          continue;
        }
        
        // Regular file upload (non-ZIP)
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
      setShowZipCategorySelector(false);
      setSelectedZipFiles([]);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
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
    disabled: isUploading || showZipCategorySelector,
  });

  const handleContinueWithZip = () => {
    if (!selectedZipCategory) {
      toast({
        title: "Category selection required",
        description: "Please select a category for the ZIP file folder",
        variant: "destructive"
      });
      return;
    }
    
    handleUpload(selectedZipFiles, selectedZipCategory);
  };

  // If showing ZIP category selector
  if (showZipCategorySelector) {
    return (
      <div className="flex flex-col p-4 space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium">Select Category for ZIP Folder</h3>
          <p className="text-sm text-muted-foreground">
            ZIP files must be assigned to a category. The extracted files will be placed in a folder within this category.
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="zipCategory">Select a Category</Label>
            <Select
              value={selectedZipCategory}
              onValueChange={setSelectedZipCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category for ZIP folder" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {selectedZipFiles.length} ZIP {selectedZipFiles.length === 1 ? 'file' : 'files'} selected:
            <ul className="mt-1 ml-4 list-disc">
              {selectedZipFiles.map(file => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedZipFiles([]);
              setShowZipCategorySelector(false);
              setSelectedZipCategory('');
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleContinueWithZip} 
            disabled={!selectedZipCategory}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
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
                {item.status === 'processing' && (
                  <p className="text-xs text-amber-500 mt-1">Processing ZIP file...</p>
                )}
                {item.error && (
                  <p className="text-xs text-destructive mt-1">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 mt-auto border-t flex justify-end">
        <Button 
          onClick={onCancel} 
          variant="outline" 
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
};

export default DragDropUploader;
