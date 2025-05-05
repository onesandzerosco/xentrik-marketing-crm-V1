
import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  Download,
  Trash2,
  FolderPlus,
  FolderMinus,
  Pencil
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void; // For optimistic UI updates
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
}

export function FileGrid({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onUploadClick,
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote
}: FileGridProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(new Set());
  const [removingFromFolderIds, setRemovingFromFolderIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Show remove from folder button only in custom folders (not in 'all' or 'unsorted')
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const isFileSelected = (fileId: string) => selectedFileIds.includes(fileId);
  const isFileDeleting = (fileId: string) => deletingFileIds.has(fileId);
  const isFileRemovingFromFolder = (fileId: string) => removingFromFolderIds.has(fileId);

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find(file => file.id === fileId);
      if (!fileToDelete) {
        toast({
          title: "File not found",
          description: "The file you're trying to delete does not exist.",
          variant: "destructive",
        });
        return;
      }

      // Update UI immediately
      setDeletingFileIds(prev => new Set([...prev, fileId]));
      
      // Notify parent for optimistic UI update if callback exists
      if (onFileDeleted) {
        onFileDeleted(fileId);
      }

      // Remove from selection if selected
      if (selectedFileIds.includes(fileId)) {
        setSelectedFileIds(prev => prev.filter(id => id !== fileId));
      }

      // Delete in background
      const { error } = await supabase.storage
        .from('raw_uploads')
        .remove([fileToDelete.bucketPath || '']);

      if (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Error deleting file",
          description: error.message,
          variant: "destructive",
        });
        
        // Remove from deleting set if error occurs
        setDeletingFileIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        return;
      }

      // Delete the file metadata from the media table
      const { error: mediaError } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);

      if (mediaError) {
        console.error("Error deleting file metadata:", mediaError);
        toast({
          title: "Error deleting file metadata",
          description: mediaError.message,
          variant: "destructive",
        });
        
        // Remove from deleting set if error occurs
        setDeletingFileIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
        return;
      }

      toast({
        title: "File deleted",
        description: "File deleted successfully.",
      });
      
      // Remove from deleting set when complete
      setDeletingFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });

      // Refresh in background
      onFilesChanged();
      
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error deleting file",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
      
      // Remove from deleting set if error occurs
      setDeletingFileIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  React.useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(selectedFileIds);
    }
  }, [selectedFileIds, onSelectFiles]);

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(file => file.id));
    }
  };

  const isAllSelected = selectedFileIds.length === files.length && files.length > 0;
  
  // Handle file click to preview/open the file
  const handleFileClick = (file: CreatorFileType) => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4">
      {selectedFileIds.length > 0 && isCreatorView && (
        <div className="col-span-full flex items-center gap-2 mb-4">
          {onAddToFolderClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToFolderClick}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Add {selectedFileIds.length} Files to Folder
            </Button>
          )}
        </div>
      )}
      
      {files.map((file) => {
        let Icon = File;
        if (file.type === 'image') Icon = FileImage;
        if (file.type === 'video') Icon = FileVideo;
        if (file.type === 'audio') Icon = FileAudio;
        if (file.type === 'document') Icon = FileText;

        const isNew = recentlyUploadedIds?.includes(file.id);
        const isDeleting = isFileDeleting(file.id);
        const isRemoving = isFileRemovingFromFolder(file.id);

        // Skip rendering files being deleted or removed from folder when in folder view
        if (isDeleting || (isRemoving && currentFolder !== 'all' && currentFolder !== 'unsorted')) return null;

        return (
          <Card key={file.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative">
              {isCreatorView && (
                <div className="absolute top-2 right-2 z-10">
                  <Checkbox
                    checked={isFileSelected(file.id)}
                    onCheckedChange={() => toggleFileSelection(file.id)}
                    className="bg-background/80"
                  />
                </div>
              )}
              
              {/* Thumbnail container that fills the available space */}
              <div 
                className="relative h-40 w-full cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                {/* Default icon shown when no thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center bg-secondary">
                  <Icon className="h-12 w-12 text-muted-foreground" />
                </div>
                
                {/* Actual image or video thumbnail overlay */}
                {file.type === 'image' && file.url && (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {file.type === 'video' && file.thumbnail_url && (
                  <img
                    src={file.thumbnail_url}
                    alt={file.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                
                {/* Action buttons overlay on hover */}
                {isCreatorView && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                    <a href={file.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    {onEditNote && (
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditNote(file);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {showRemoveFromFolder && onRemoveFromFolder && (
                      <Button 
                        variant="secondary" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            // Optimistically update UI
                            setRemovingFromFolderIds(prev => new Set([...prev, file.id]));
                            
                            if (onFileDeleted && currentFolder !== 'all' && currentFolder !== 'unsorted') {
                              onFileDeleted(file.id); // Optimistically update UI
                            }
                            
                            await onRemoveFromFolder([file.id], currentFolder);
                            
                            toast({
                              title: "File removed",
                              description: `Removed ${file.name} from folder`,
                            });
                            
                            // Remove from removing set when complete
                            setRemovingFromFolderIds(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(file.id);
                              return newSet;
                            });
                            
                            onFilesChanged(); // Refresh in background
                          } catch (error) {
                            console.error("Error removing file from folder:", error);
                            
                            // Remove from removing set if error occurs
                            setRemovingFromFolderIds(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(file.id);
                              return newSet;
                            });
                            
                            toast({
                              title: "Error",
                              description: "Failed to remove file from folder",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        <FolderMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* File details section below thumbnail but inside card */}
            <CardContent className="p-4 flex-grow">
              <div className="mt-1 text-sm font-medium truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} - {formatDate(file.created_at)}
                {isNew && (
                  <span className="ml-1 rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
                    New
                  </span>
                )}
              </div>
              {file.description && (
                <div className="mt-1 text-xs text-muted-foreground italic truncate">
                  "{file.description}"
                </div>
              )}
            </CardContent>
            
            {isCreatorView && onUploadClick && (
              <CardFooter className="p-3 pt-0 mt-auto">
                <Button variant="outline" size="sm" onClick={onUploadClick} className="w-full">
                  Upload
                </Button>
              </CardFooter>
            )}
          </Card>
        );
      })}
      {files.length === 0 && (
        <div className="col-span-full text-center py-10">No files found.</div>
      )}
    </div>
  );
}
