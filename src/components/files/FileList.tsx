
import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
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
  const { canDelete } = useFilePermissions();

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

  const handleRemoveFromFolder = async () => {
    if (!showRemoveFromFolder || !onRemoveFromFolder || selectedFileIds.length === 0) {
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
    // We don't need to do anything here as we have dedicated preview button now
    // This is just a stub to satisfy the interface
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
        onAddToFolderClick={onAddToFolderClick}
        showRemoveFromFolder={showRemoveFromFolder}
        onRemoveFromFolder={onRemoveFromFolder}
        currentFolder={currentFolder}
        handleRemoveFromFolder={handleRemoveFromFolder}
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
