
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface UseFileGridProps {
  files: CreatorFileType[];
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
  onSelectFiles?: (fileIds: string[]) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export function useFileGrid({
  files,
  onFilesChanged,
  onFileDeleted,
  onSelectFiles,
  currentFolder = 'all',
  onRemoveFromFolder,
}: UseFileGridProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(new Set());
  const [removingFromFolderIds, setRemovingFromFolderIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Show remove from folder button only in custom folders (not in 'all' or 'unsorted')
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';

  useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(selectedFileIds);
    }
  }, [selectedFileIds, onSelectFiles]);

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

  const handleDeleteFile = async (fileId: string, canDelete: boolean) => {
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

  // Handle removing a file from folder
  const handleRemoveFromFolder = async (fileId: string) => {
    if (!onRemoveFromFolder || currentFolder === 'all' || currentFolder === 'unsorted') {
      return;
    }
    
    try {
      // Optimistically update UI
      setRemovingFromFolderIds(prev => new Set([...prev, fileId]));
      
      if (onFileDeleted && currentFolder !== 'all' && currentFolder !== 'unsorted') {
        onFileDeleted(fileId); // Optimistically update UI
      }
      
      await onRemoveFromFolder([fileId], currentFolder);
      
      toast({
        title: "File removed",
        description: `Removed file from folder`,
      });
      
      // Remove from removing set when complete
      setRemovingFromFolderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      
      onFilesChanged(); // Refresh in background
    } catch (error) {
      console.error("Error removing file from folder:", error);
      
      // Remove from removing set if error occurs
      setRemovingFromFolderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
      
      toast({
        title: "Error",
        description: "Failed to remove file from folder",
        variant: "destructive",
      });
    }
  };

  return {
    selectedFileIds,
    setSelectedFileIds,
    toggleFileSelection,
    isFileSelected,
    isFileDeleting,
    isFileRemovingFromFolder,
    showRemoveFromFolder,
    handleDeleteFile,
    handleRemoveFromFolder
  };
}
