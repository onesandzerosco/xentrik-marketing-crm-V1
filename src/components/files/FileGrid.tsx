
import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Share2, Download, CheckCircle } from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from "@/components/ui/checkbox";

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged?: () => void;
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  isCreatorView = false, 
  onFilesChanged,
  recentlyUploadedIds = [],
  onUploadClick,
  onSelectFiles
}) => {
  const { toast } = useToast();
  const { userRole } = useAuth();
  const isAdmin = userRole === "Admin";
  const canDeleteFiles = isAdmin || isCreatorView;
  
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  
  // Update parent component when selection changes
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      
      if (onSelectFiles) {
        onSelectFiles(Array.from(newSet));
      }
      
      return newSet;
    });
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
      
      setProcessingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });

      // Also remove from selected files
      if (selectedFiles.has(file.id)) {
        toggleFileSelection(file.id);
      }
      
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

  // Function to bulk delete selected files
  const handleBulkDelete = async () => {
    const filesToDelete = files.filter(file => selectedFiles.has(file.id));
    
    for (const file of filesToDelete) {
      await handleDelete(file);
    }
  };

  // Function to download selected files
  const handleBulkDownload = () => {
    const filesToDownload = files.filter(file => selectedFiles.has(file.id));
    
    for (const file of filesToDownload) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      link.target = "_blank";
      link.click();
    }
  };

  if (files.length === 0 && onUploadClick) {
    return (
      <div className="flex flex-col items-center justify-center border rounded-lg p-10 text-center h-full">
        <Upload className="h-8 w-8 mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No files available</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload files to see them here
        </p>
        <Button onClick={onUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Action buttons for selected files */}
      {selectedFiles.size > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download {selectedFiles.size} files
          </Button>
          
          {canDeleteFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete {selectedFiles.size} files
            </Button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {files.map((file) => {
          const isProcessing = processingFiles.has(file.id);
          const isSelected = selectedFiles.has(file.id);
          const isNewlyUploaded = recentlyUploadedIds.includes(file.id);
          
          return (
            <div 
              key={file.id} 
              className={`relative border rounded-lg overflow-hidden group ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${isNewlyUploaded ? 'border border-yellow-400' : ''}`}
              onClick={() => toggleFileSelection(file.id)}
            >
              {/* Add checkbox in the top right */}
              <div className="absolute top-2 right-2 z-10">
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => toggleFileSelection(file.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-5 w-5 border-2 bg-background/80 hover:bg-background"
                />
              </div>
              
              <div className="aspect-square bg-muted/20 flex items-center justify-center">
                {file.type === 'image' ? (
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-3xl font-light text-muted-foreground">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = file.url;
                    link.download = file.name;
                    link.target = "_blank";
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(file);
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                
                {canDeleteFiles && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
