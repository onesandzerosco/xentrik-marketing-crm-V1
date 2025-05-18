
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useFileGrid } from './grid/useFileGrid';
import { FileGridHeader } from './grid/FileGridHeader';
import { EmptyState } from './grid/EmptyState';
import { FileGridContainer } from './grid/FileGridContainer';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>; 
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
}

export function FileGrid({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote,
  onAddTag
}: FileGridProps) {
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleRemoveFromFolder
  } = useFileGrid({
    files,
    onFilesChanged,
    onFileDeleted,
    onSelectFiles,
    currentFolder,
    onRemoveFromFolder
  });

  const { canManageFolders, canDelete } = useFilePermissions();
  const { toast } = useToast();
  
  // Prepare the handler for removing files from folder via button in header
  const handleRemoveFilesFromFolder = () => {
    if (selectedFileIds.length > 0 && onRemoveFromFolder && currentFolder !== 'all' && currentFolder !== 'unsorted') {
      onRemoveFromFolder(selectedFileIds, currentFolder);
      setSelectedFileIds([]);
    }
  };

  // Handle batch delete files
  const handleDeleteFiles = async () => {
    if (selectedFileIds.length === 0 || !canDelete) return;
    
    try {
      // Find the files to delete
      const filesToDelete = files.filter(file => selectedFileIds.includes(file.id));
      
      // Start the deletion process
      toast({
        title: "Deleting files",
        description: `Deleting ${selectedFileIds.length} files...`,
      });
      
      // Delete each file
      for (const file of filesToDelete) {
        // Delete the file from storage
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
          await onFileDeleted(file.id);
        }
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
    }
  };

  if (files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4">
      <FileGridHeader 
        selectedFileIds={selectedFileIds}
        isCreatorView={isCreatorView}
        onAddToFolderClick={canManageFolders ? onAddToFolderClick : undefined}
        currentFolder={currentFolder}
        onRemoveFromFolderClick={canManageFolders ? handleRemoveFilesFromFolder : undefined}
        onDeleteFilesClick={canDelete ? handleDeleteFiles : undefined}
      />
      
      <FileGridContainer 
        files={files}
        isCreatorView={isCreatorView}
        onFilesChanged={onFilesChanged}
        onFileDeleted={onFileDeleted}
        recentlyUploadedIds={recentlyUploadedIds}
        onSelectFiles={setSelectedFileIds}
        selectedFileIds={selectedFileIds}
        onEditNote={onEditNote}
        onAddTag={onAddTag}
        currentFolder={currentFolder}
        onRemoveFromFolder={onRemoveFromFolder}
      />
    </div>
  );
}
