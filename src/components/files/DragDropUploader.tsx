
import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileInput, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProgress {
  name: string;
  progress: number;
  size: number;
  error?: string;
}

interface DragDropUploaderProps {
  creatorId: string;
  folder?: string;
  bucket?: string;
  onUploadComplete: () => void;
  onCancel: () => void;
}

const DragDropUploader: React.FC<DragDropUploaderProps> = ({
  creatorId,
  folder = 'shared',
  bucket = 'raw_uploads',
  onUploadComplete,
  onCancel
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileProgress, setFileProgress] = useState<FileUploadProgress[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Calculate total bytes and uploaded bytes
  const totalBytes = fileProgress.reduce((sum, file) => sum + file.size, 0);
  const uploadedBytes = fileProgress.reduce((sum, file) => sum + (file.size * (file.progress / 100)), 0);
  
  // Calculate overall progress percentage
  const calculateOverallProgress = useCallback(() => {
    if (totalBytes === 0) return 0;
    return Math.round((uploadedBytes / totalBytes) * 100 * 100) / 100; // Limit to 2 decimal places
  }, [totalBytes, uploadedBytes]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const uploadFile = async (file: File, fileIndex: number) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${creatorId}/${folder}/${safeName}`;
    
    try {
      // Initialize progress for this file
      setFileProgress(prev => {
        const newProgress = [...prev];
        newProgress[fileIndex] = { 
          name: file.name, 
          progress: 0, 
          size: file.size 
        };
        return newProgress;
      });
      
      // Create a custom upload handler with progress tracking
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });
        
      if (error) throw error;
      
      // If using raw_uploads bucket, add to the media table
      if (bucket === 'raw_uploads') {
        const { error: mediaError } = await supabase
          .from('media')
          .insert({
            creator_id: creatorId,
            bucket_key: filePath,
            filename: safeName,
            mime: file.type,
            file_size: file.size
          });
          
        if (mediaError) {
          console.error('Media record creation error:', mediaError);
          setFileProgress(prev => {
            const newProgress = [...prev];
            newProgress[fileIndex] = { 
              ...newProgress[fileIndex], 
              error: 'Failed to record file metadata' 
            };
            return newProgress;
          });
        }
      }
      
      // Mark as complete
      setFileProgress(prev => {
        const newProgress = [...prev];
        newProgress[fileIndex] = { 
          ...newProgress[fileIndex], 
          progress: 100 
        };
        return newProgress;
      });
      
      // Update overall progress
      setOverallProgress(calculateOverallProgress());
      
      return true;
    } catch (error) {
      console.error('Upload error:', error);
      setFileProgress(prev => {
        const newProgress = [...prev];
        newProgress[fileIndex] = { 
          ...newProgress[fileIndex], 
          error: error instanceof Error ? error.message : 'Upload failed' 
        };
        return newProgress;
      });
      return false;
    }
  };

  const processFiles = async (files: FileList) => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setFileProgress([]);
    setOverallProgress(0);
    
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const success = await uploadFile(files[i], i);
      if (success) successCount++;
      
      // Update the overall progress after each file completes
      const progressValue = ((i + 1) / files.length * 100);
      setOverallProgress(Math.round(progressValue * 100) / 100); // Limit to 2 decimal places
    }
    
    // All uploads complete
    setIsUploading(false);
    
    if (successCount > 0) {
      toast({
        title: successCount > 1 ? `${successCount} files uploaded` : '1 file uploaded',
        description: 'Files have been successfully uploaded',
      });
      
      // Call the completion callback
      onUploadComplete();
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Upload Files</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              className="hidden" 
              onChange={handleFileSelect} 
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="py-4">
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium">Uploading files...</p>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center cursor-pointer"
                onClick={handleBrowseClick}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Support for all file types
                </p>
              </div>
            )}
          </div>
          
          {/* Progress Section */}
          {fileProgress.length > 0 && (
            <div className="mt-6 space-y-4">
              {/* Overall Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Overall Progress</span>
                  <span>{overallProgress.toFixed(2)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              
              {/* Individual Files */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {fileProgress.map((file, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="truncate max-w-[70%]">{file.name}</span>
                      {file.error ? (
                        <span className="text-destructive">Failed</span>
                      ) : (
                        <span>{file.progress.toFixed(2)}%</span>
                      )}
                    </div>
                    <Progress 
                      value={file.progress} 
                      className={`h-1 ${file.error ? 'bg-destructive/30' : ''}`} 
                    />
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">{file.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              variant="outline" 
              onClick={onCancel} 
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBrowseClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Uploading...
                </>
              ) : 'Select Files'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropUploader;
