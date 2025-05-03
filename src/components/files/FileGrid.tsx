
import React, { useState, useEffect } from 'react';
import { FileText, Image, File, Video, AudioLines, Download, Share2, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged?: () => void;
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  isCreatorView = false, 
  onFilesChanged,
  recentlyUploadedIds = [],
  onUploadClick
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

  const getFileIcon = (type: string, large = false) => {
    const size = large ? "h-12 w-12" : "h-5 w-5";
    
    switch (type) {
      case 'image':
        return <Image className={`${size} text-blue-500`} />;
      case 'document':
        return <FileText className={`${size} text-orange-500`} />;
      case 'video':
        return <Video className={`${size} text-red-500`} />;
      case 'audio':
        return <AudioLines className={`${size} text-green-500`} />;
      default:
        return <File className={`${size} text-gray-500`} />;
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
  
  const handleSelectAll = () => {
    if (selectedFiles.size === displayFiles.length) {
      setSelectedFiles(new Set());
    } else {
      const allFileIds = displayFiles.map(file => file.id);
      setSelectedFiles(new Set(allFileIds));
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

  const renderPreview = (file: CreatorFileType) => {
    if (file.type === 'image' && file.url) {
      return (
        <div className="aspect-square bg-accent/10 flex items-center justify-center overflow-hidden rounded-md">
          <img 
            src={file.url} 
            alt={file.name} 
            className="object-cover w-full h-full"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<div class="flex items-center justify-center w-full h-full">${getFileIcon(file.type, true)}</div>`;
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="aspect-square bg-accent/5 flex items-center justify-center rounded-md">
        {getFileIcon(file.type, true)}
      </div>
    );
  };

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
        <div className="flex gap-2">
          {selectedFiles.size > 0 ? (
            <>
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
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              {isCreatorView && onUploadClick && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onUploadClick}
                  className="text-primary"
                >
                  <UploadCloud className="h-3.5 w-3.5 mr-1" /> Upload
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayFiles.map((file) => {
          const isProcessing = processingFiles.has(file.id);
          const isChecked = selectedFiles.has(file.id);
          const isNewlyUploaded = recentlyUploadedIds.includes(file.id);
          
          return (
            <div
              key={file.id}
              className={`group border rounded-lg overflow-hidden transition-all ${
                isChecked 
                  ? 'border-primary ring-2 ring-primary/30' 
                  : isNewlyUploaded
                  ? 'border-yellow-400 ring-2 ring-yellow-300/30'
                  : 'hover:border-primary/50'
              }`}
            >
              <div className="relative">
                {renderPreview(file)}
                <div className="absolute top-2 right-2">
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={(checked) => handleSelectFile(file.id, !!checked)}
                    disabled={isProcessing || file.status === 'uploading'}
                    className="bg-white/80 backdrop-blur-sm border-gray-400"
                  />
                </div>
              </div>
              
              <div className="p-3">
                <div className="text-sm font-medium truncate text-left mb-1">
                  {file.name}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
              
              <div className="px-3 pb-3 flex gap-2">
                {file.status === 'uploading' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full"
                  >
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    <span>Uploading...</span>
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        <span>Download</span>
                      </a>
                    </Button>
                    
                    {canDeleteFiles && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(file)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}

                    {!canDeleteFiles && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(file)}
                        disabled={isProcessing}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
