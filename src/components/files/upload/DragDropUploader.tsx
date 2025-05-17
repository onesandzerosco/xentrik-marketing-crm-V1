
import React, { useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from "@/components/ui/button";
import { UploadCloud, X, FileArchive } from "lucide-react";
import { useFileUploadHandler } from "./FileUploadHandler";
import { UploadProgressDisplay } from "./UploadProgressDisplay";
import { CategorySelector } from './CategorySelector';
import { isZipFile } from '@/utils/zipUtils';
import { Category } from '@/types/fileTypes';

interface DragDropUploaderProps {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  onCancel?: () => void;
  currentFolder: string;
  availableCategories?: Category[];
}

interface FormValues {
  zipCategory: string;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({
  creatorId,
  onUploadComplete,
  onCancel,
  currentFolder,
  availableCategories = []
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [hasZipFile, setHasZipFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      zipCategory: "",
    }
  });
  
  const {
    isUploading,
    fileStatuses,
    overallProgress,
    showProgress,
    setShowProgress,
    handleCancelUpload,
    MAX_FILE_SIZE_GB
  } = useFileUploadHandler({
    creatorId,
    currentFolder,
    onUploadComplete
  });

  // Process the selected files
  const processSelectedFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    
    // Check if there's at least one ZIP file
    const containsZipFile = fileArray.some(file => isZipFile(file.name));
    setHasZipFile(containsZipFile);
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processSelectedFiles(e.target.files);
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processSelectedFiles(e.dataTransfer.files);
  };

  // Handle clicking on the drop area
  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear selected files
  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setHasZipFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start the upload process
  const handleUpload = async (values: FormValues) => {
    if (!selectedFiles.length) return;
    
    // Create a custom event with the selected files
    const customEvent = {
      target: {
        files: selectedFiles,
        value: '',  // This will be reset after upload
      },
      currentTarget: {
        files: selectedFiles,
        value: '',
      },
      zipCategoryId: hasZipFile ? values.zipCategory : undefined
    } as unknown as React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string };
    
    // Pass to the upload handler
    await handleFileUploadWithCategory(customEvent);
    
    // Clear selected files after upload
    clearSelectedFiles();
  };
  
  // Custom handler that wraps the original handler to include category info
  const handleFileUploadWithCategory = async (
    e: React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string }
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const customEvent = {
      ...e,
      // Add any custom properties needed for ZIP file processing
      zipCategoryId: e.zipCategoryId
    };
    
    // This would need to be implemented in your FileUploadHandler.ts
    if (typeof handleFileUpload === 'function') {
      await handleFileUpload(customEvent);
    }
  };
  
  // We need to implement a stub here
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string }
  ) => {
    console.log("Would upload files with category:", e.zipCategoryId);
    // This is just a placeholder - the actual implementation would be in your FileUploadHandler
    if (onUploadComplete) {
      onUploadComplete([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {showProgress && fileStatuses.length > 0 ? (
        <UploadProgressDisplay 
          fileStatuses={fileStatuses}
          overallProgress={overallProgress}
          onCancel={handleCancelUpload}
        />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-4 flex-1 flex flex-col">
            <div 
              className={`
                border-2 border-dashed rounded-lg p-6 flex-1
                flex flex-col items-center justify-center space-y-4
                cursor-pointer transition-colors
                ${isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}
              `}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleAreaClick}
            >
              {selectedFiles.length > 0 ? (
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Selected Files</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelectedFiles();
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center p-2 rounded-md bg-muted">
                        {isZipFile(file.name) ? (
                          <FileArchive className="h-4 w-4 mr-2 text-amber-600" />
                        ) : (
                          <div className="w-4 h-4 mr-2 rounded-full bg-primary/20" />
                        )}
                        <span className="text-sm truncate flex-1">
                          {file.name} <span className="text-xs text-muted-foreground">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {hasZipFile && availableCategories.length > 0 && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center mb-2">
                        <FileArchive className="h-4 w-4 mr-2 text-amber-600" />
                        <span className="text-sm font-medium">ZIP File Detected</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">
                        Please select a category where the folder extracted from the ZIP file will be created.
                      </p>
                      <CategorySelector
                        categories={availableCategories}
                        control={form.control}
                        name="zipCategory"
                        label="Category for ZIP folder"
                        placeholder="Select a category"
                        required={hasZipFile}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <UploadCloud className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-medium">Drag and drop your files</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Drop your files here or click to browse. Maximum file size: {MAX_FILE_SIZE_GB}GB.
                    </p>
                    <Button variant="secondary" type="button" size="sm" className="mt-2">
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Browse files
                    </Button>
                  </div>
                </>
              )}
              
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
            
            <div className="flex items-center justify-end space-x-2 pt-2">
              {onCancel && (
                <Button variant="outline" type="button" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={selectedFiles.length === 0 || (hasZipFile && !form.watch('zipCategory'))}
              >
                <UploadCloud className="h-4 w-4 mr-2" />
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default DragDropUploader;
