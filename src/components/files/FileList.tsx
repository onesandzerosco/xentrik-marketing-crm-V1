import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useFilePermissions } from '@/utils/permissionUtils';

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void; // New prop for optimistic UI updates
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(new Set());
  const [removingFromFolderIds, setRemovingFromFolderIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { canDelete, canEdit } = useFilePermissions();

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

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(file => file.id));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    // Check permission before proceeding
    if (!canDelete) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete files.",
        variant: "destructive",
      });
      return;
    }

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

  const handleRemoveFromFolder = async () => {
    if (!showRemoveFromFolder || !onRemoveFromFolder || selectedFileIds.length === 0) {
      return;
    }
    
    try {
      // Optimistically update UI by marking files as removing
      const fileIdsToRemove = [...selectedFileIds];
      
      // Update UI immediately
      setRemovingFromFolderIds(prev => new Set([...prev, ...fileIdsToRemove]));
      
      // Notify parent for optimistic UI update if callback exists
      if (onFileDeleted && currentFolder !== 'all' && currentFolder !== 'unsorted') {
        fileIdsToRemove.forEach(fileId => {
          onFileDeleted(fileId);
        });
      }
      
      // Send removal request in background
      await onRemoveFromFolder(fileIdsToRemove, currentFolder);
      
      toast({
        title: "Files removed from folder",
        description: `Successfully removed ${fileIdsToRemove.length} files from this folder`,
      });
      
      // Update selection state
      setSelectedFileIds([]);
      
      // Remove from removing set when complete
      setRemovingFromFolderIds(prev => {
        const newSet = new Set(prev);
        fileIdsToRemove.forEach(id => newSet.delete(id));
        return newSet;
      });
    } catch (error) {
      console.error("Error removing files from folder:", error);
      toast({
        title: "Error",
        description: "Failed to remove files from folder",
        variant: "destructive",
      });
      
      // Remove from removing set if error occurs
      setRemovingFromFolderIds(prev => {
        const newSet = new Set(prev);
        selectedFileIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  };

  React.useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(selectedFileIds);
    }
  }, [selectedFileIds, onSelectFiles]);

  const isAllSelected = selectedFileIds.length === files.length && files.length > 0;
  
  // Handle file row click to preview/open the file
  const handleFileClick = (file: CreatorFileType) => {
    window.open(file.url, '_blank');
  };

  return (
    <div className="w-full relative overflow-x-auto">
      {selectedFileIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
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
          
          {showRemoveFromFolder && onRemoveFromFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFromFolder}
            >
              <FolderMinus className="h-4 w-4 mr-2" />
              Remove {selectedFileIds.length} Files from Folder
            </Button>
          )}
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              {isCreatorView && (
                <Checkbox
                  checked={isAllSelected}
                  aria-label="Select all"
                  onCheckedChange={handleSelectAll}
                />
              )}
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date Added</TableHead>
            {isCreatorView && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
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
              <TableRow key={file.id} className={isCreatorView ? "cursor-pointer" : ""} onClick={() => isCreatorView && handleFileClick(file)}>
                <TableCell className="font-medium" onClick={(e) => e.stopPropagation()}>
                  {isCreatorView && (
                    <Checkbox
                      checked={isFileSelected(file.id)}
                      onCheckedChange={() => toggleFileSelection(file.id)}
                    />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    {isNew && (
                      <span className="ml-1 rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
                        New
                      </span>
                    )}
                  </div>
                  {file.description && (
                    <div className="text-xs text-muted-foreground italic truncate max-w-[200px] mt-1">
                      "{file.description}"
                    </div>
                  )}
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDate(file.created_at)}</TableCell>
                {isCreatorView && (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 flex-wrap">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      
                      {canDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onEditNote && canEdit && (
                        <Button 
                          variant="ghost" 
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
                          variant="ghost" 
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
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {files.length === 0 && (
            <TableRow>
              <TableCell colSpan={isCreatorView ? 6 : 5} className="text-center">
                No files found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
