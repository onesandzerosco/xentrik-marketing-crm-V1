
import React, { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useFilePermissions } from '@/utils/permissionUtils';
import { FileListHeader } from './list/FileListHeader';
import { FileListItem } from './list/FileListItem';
import { FileListBatchActions } from './list/FileListBatchActions';
import { FileListEmptyState } from './list/FileListEmptyState';

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
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
  const { toast } = useToast();
  const { canDelete, canManageFolders } = useFilePermissions();

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

  // Handle bulk deletion of files
  const handleDeleteFiles = async () => {
    if (selectedFileIds.length === 0 || !canDelete) return;
    
    try {
      toast({
        title: "Deleting files",
        description: `Deleting ${selectedFileIds.length} files...`,
      });
      
      // Find the files to delete
      const filesToDelete = files.filter(file => selectedFileIds.includes(file.id));
      
      // Update UI for all files being deleted
      const newDeletingIds = new Set(deletingFileIds);
      selectedFileIds.forEach(id => newDeletingIds.add(id));
      setDeletingFileIds(newDeletingIds);
      
      // Delete each file
      for (const file of filesToDelete) {
        // Delete the file from storage if it has a bucketPath
        if (file.bucketPath) {
          await supabase.storage
            .from('raw_uploads')
            .remove([file.bucketPath]);
        }
        
        // Delete the file metadata
        await supabase
          .from('media')
          .delete()
          .eq('id', file.id);
          
        // Notify parent component if callback exists
        if (onFileDeleted) {
          onFileDeleted(file.id);
        }
        
        // Remove from deleting set when complete
        setDeletingFileIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.id);
          return newSet;
        });
      }
      
      // Clear selection
      setSelectedFileIds([]);
      
      // Show success message
      toast({
        title: "Files deleted",
        description: `Successfully deleted ${selectedFileIds.length} files`,
      });
      
      // Refresh file list
      onFilesChanged();
    } catch (error) {
      console.error("Error deleting files:", error);
      toast({
        title: "Error",
        description: "There was an error deleting the files",
        variant: "destructive",
      });
      
      // Clear deleting state
      setDeletingFileIds(new Set());
    }
  };

  const handleRemoveFromFolder = async () => {
    if (!showRemoveFromFolder || !onRemoveFromFolder || selectedFileIds.length === 0 || !canManageFolders) {
      return;
    }
    
    try {
      // Send removal request
      await onRemoveFromFolder(selectedFileIds, currentFolder);
      
      toast({
        title: "Files removed from folder",
        description: `Successfully removed ${selectedFileIds.length} files from this folder`,
      });
      
      // Notify parent for optimistic UI update if callback exists
      if (onFileDeleted && currentFolder !== 'all' && currentFolder !== 'unsorted') {
        selectedFileIds.forEach(fileId => {
          onFileDeleted(fileId);
        });
      }
      
      // Update selection state
      setSelectedFileIds([]);
      
      // Refresh in background
      onFilesChanged();
    } catch (error) {
      console.error("Error removing files from folder:", error);
      
      toast({
        title: "Error",
        description: "Failed to remove files from folder",
        variant: "destructive",
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
    // This is just a stub - we have dedicated preview button now
  };

  // Filter out files being deleted when in folder view
  const visibleFiles = files.filter(file => {
    if (currentFolder !== 'all' && currentFolder !== 'unsorted') {
      return !isFileDeleting(file.id);
    }
    return true;
  });

  return (
    <div className="w-full relative overflow-x-auto">
      <FileListBatchActions
        selectedFileIds={selectedFileIds}
        onAddToFolderClick={canManageFolders ? onAddToFolderClick : undefined}
        showRemoveFromFolder={showRemoveFromFolder}
        onRemoveFromFolder={onRemoveFromFolder}
        currentFolder={currentFolder}
        handleRemoveFromFolder={handleRemoveFromFolder}
        onDeleteFiles={canDelete ? handleDeleteFiles : undefined}
      />
      
      <Table>
        <FileListHeader
          isCreatorView={isCreatorView}
          isAllSelected={isAllSelected}
          handleSelectAll={handleSelectAll}
        />
        <TableBody>
          {visibleFiles.length === 0 ? (
            <FileListEmptyState isCreatorView={isCreatorView} />
          ) : (
            visibleFiles.map((file) => (
              !isFileDeleting(file.id) && (
                <FileListItem
                  key={file.id}
                  file={file}
                  isCreatorView={isCreatorView}
                  isFileSelected={isFileSelected}
                  toggleFileSelection={toggleFileSelection}
                  handleFileClick={handleFileClick}
                  handleDeleteFile={handleDeleteFile}
                  showRemoveFromFolder={showRemoveFromFolder}
                  onRemoveFromFolder={onRemoveFromFolder}
                  currentFolder={currentFolder}
                  onEditNote={onEditNote}
                  onFileDeleted={onFileDeleted}
                  onFilesChanged={onFilesChanged}
                />
              )
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
