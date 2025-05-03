
import React, { useState, useEffect } from 'react';
import { FileText, Image, File, Video, AudioLines, Download, Share2, Loader2, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged?: () => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  isCreatorView = false, 
  onFilesChanged,
  recentlyUploadedIds = [],
  onSelectFiles
}) => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";
  const totalFiles = files.length;
  const uploadingFiles = files.filter(file => file.status === 'uploading').length;
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  const [displayFiles, setDisplayFiles] = useState<CreatorFileType[]>(files);
  
  // Update display files when input files change
  useEffect(() => {
    setDisplayFiles(files);
  }, [files]);
  
  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(Array.from(selectedFiles));
    }
  }, [selectedFiles, onSelectFiles]);
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <AudioLines className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleShare = (file: CreatorFileType) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };
  
  const handleDelete = async (file: CreatorFileType) => {
    try {
      setProcessingFiles(prev => new Set([...prev, file.id]));
      
      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('raw_uploads')
        .remove([file.bucketPath || '']);
        
      if (storageError) throw storageError;
      
      // Delete the media record if it exists
      if (file.id) {
        const { error: mediaError } = await supabase
          .from('media')
          .delete()
          .eq('id', file.id);
          
        if (mediaError) throw mediaError;
      }
      
      // Remove from selected files
      setSelectedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      // Remove from processing files
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      // Update local display files to immediately remove this file
      setDisplayFiles(prev => prev.filter(f => f.id !== file.id));
      
      // Notify parent component about the change
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      toast({
        title: "File deleted",
        description: `Successfully deleted ${file.name}`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete the file",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    try {
      const selectedFileIds = Array.from(selectedFiles);
      const selectedFileObjects = displayFiles.filter(file => selectedFiles.has(file.id));
      
      // Add all files to processing state
      setProcessingFiles(new Set(selectedFileIds));
      
      // Keep track of successfully deleted file IDs
      const deletedFileIds = new Set<string>();
      
      for (const file of selectedFileObjects) {
        try {
          // Delete the file from storage
          await supabase.storage
            .from('raw_uploads')
            .remove([file.bucketPath || '']);
          
          // Delete the media record if it exists
          if (file.id) {
            await supabase
              .from('media')
              .delete()
              .eq('id', file.id);
          }
          
          // Mark this file as successfully deleted
          deletedFileIds.add(file.id);
        } catch (error) {
          console.error(`Error deleting file ${file.id}:`, error);
          // Continue with other files
        }
      }
      
      // Update local display files to immediately remove deleted files
      setDisplayFiles(prev => prev.filter(f => !deletedFileIds.has(f.id)));
      
      // Clear selections and processing state
      setSelectedFiles(new Set());
      setProcessingFiles(new Set());
      
      // Notify parent component about the change
      if (onFilesChanged) {
        onFilesChanged();
      }
      
      toast({
        title: "Files deleted",
        description: `Successfully deleted ${deletedFileIds.size} files`,
      });
    } catch (error) {
      console.error('Delete selected error:', error);
      
      setProcessingFiles(new Set());
      
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete selected files",
        variant: "destructive",
      });
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allFileIds = displayFiles.map(file => file.id);
      setSelectedFiles(new Set(allFileIds));
    } else {
      setSelectedFiles(new Set());
    }
  };
  
  const handleSelectFile = (fileId: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  };
  
  const downloadSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    for (const fileId of selectedFiles) {
      const file = displayFiles.find(f => f.id === fileId);
      if (file && file.url) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        link.target = "_blank";
        link.click();
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  };

  // Determine if the current user can delete files (either admin or creator)
  const canDeleteFiles = isAdmin || isCreatorView;
  
  const allSelected = displayFiles.length > 0 && selectedFiles.size === displayFiles.length;
  const someSelected = selectedFiles.size > 0 && selectedFiles.size < displayFiles.length;

  return (
    <>
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="text-sm text-muted-foreground">
          {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
          {uploadingFiles > 0 && (
            <span className="ml-2 text-primary">
              ({uploadingFiles} uploading)
            </span>
          )}
          {selectedFiles.size > 0 && (
            <span className="ml-2">
              | {selectedFiles.size} selected
            </span>
          )}
        </div>
        {selectedFiles.size > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadSelected}
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Download Selected
            </Button>
            {canDeleteFiles && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDeleteSelected}
                className="text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Selected
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_100px_150px_120px] gap-3 px-4 py-3 font-medium text-xs border-b bg-muted/20">
          <div className="flex items-center">
            <Checkbox 
              checked={allSelected} 
              onCheckedChange={handleSelectAll}
              className="data-[state=indeterminate]:bg-primary"
              data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
            />
          </div>
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y">
          {displayFiles.map((file) => {
            const isProcessing = processingFiles.has(file.id);
            const isChecked = selectedFiles.has(file.id);
            const isNewlyUploaded = recentlyUploadedIds.includes(file.id);
            
            return (
              <div
                key={file.id}
                className={`grid grid-cols-[40px_1fr_100px_150px_120px] gap-3 px-4 py-3 hover:bg-muted/10 transition-colors items-center ${
                  isNewlyUploaded ? 'border border-yellow-400 bg-yellow-50/10' : ''
                }`}
              >
                <div className="flex items-center">
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={(checked) => handleSelectFile(file.id, !!checked)}
                    disabled={isProcessing || file.status === 'uploading'}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(file.type)}
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(file.created_at)}
                </div>
                <div className="flex justify-end gap-2">
                  {file.status === 'uploading' ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled
                      className="h-7 px-2"
                    >
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="h-7 px-2"
                        disabled={isProcessing}
                      >
                        <a 
                          href={file.url} 
                          download={file.name} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label={`Download ${file.name}`}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      {canDeleteFiles && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          className="h-7 px-2 text-red-500 hover:text-red-600"
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(file)}
                        className="h-7 px-2"
                        disabled={isProcessing}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
