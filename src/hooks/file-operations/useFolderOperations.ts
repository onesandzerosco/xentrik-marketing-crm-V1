
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types/fileTypes';

interface FolderOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders?: React.Dispatch<React.SetStateAction<Folder[]>>;
  setCurrentFolder?: (folderId: string) => void;
}

export const useFolderOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setCurrentFolder
}: FolderOperationsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Add files to an existing folder
  const handleAddFilesToFolder = async (fileIds: string[], folderId: string, categoryId: string): Promise<void> => {
    if (!creatorId || fileIds.length === 0) {
      toast({
        title: "Error",
        description: "Creator ID and file IDs are required to add files to a folder",
        variant: "destructive"
      });
      return Promise.reject("Missing required parameters");
    }
    
    try {
      setIsProcessing(true);
      
      // For each file, update it to add the folder if not already in the folders array
      for (const fileId of fileIds) {
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders')
          .eq('id', fileId)
          .single();
        
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        const currentFolders = fileData.folders || [];
        if (!currentFolders.includes(folderId)) {
          const updatedFolders = [...currentFolders, folderId];
          
          const { error: updateError } = await supabase
            .from('media')
            .update({ folders: updatedFolders })
            .eq('id', fileId);
          
          if (updateError) {
            console.error(`Error updating file ${fileId}:`, updateError);
          }
        }
      }
      
      onFilesChanged();
      
      toast({
        title: "Files added to folder",
        description: `${fileIds.length} file(s) added to folder successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding files to folder:", error);
      toast({
        title: "Error adding files to folder",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove files from a folder
  const handleRemoveFromFolder = async (fileIds: string[], folderId: string): Promise<void> => {
    if (!creatorId || fileIds.length === 0) {
      toast({
        title: "Error",
        description: "Creator ID and file IDs are required to remove files from a folder",
        variant: "destructive"
      });
      return Promise.reject("Missing required parameters");
    }
    
    try {
      setIsProcessing(true);
      
      // For each file, remove the folder from its folders array
      for (const fileId of fileIds) {
        // First get the current folders array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders')
          .eq('id', fileId)
          .single();
        
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Filter out the folder to remove
        const updatedFolders = (fileData.folders || []).filter(
          (folder: string) => folder !== folderId
        );
        
        // Update the file with the new folders array
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', fileId);
        
        if (updateError) {
          console.error(`Error updating file ${fileId}:`, updateError);
        }
      }
      
      onFilesChanged();
      
      toast({
        title: "Files removed from folder",
        description: `${fileIds.length} file(s) removed from folder successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error removing files from folder:", error);
      toast({
        title: "Error removing files from folder",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a folder
  const handleDeleteFolder = async (folderId: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to delete a folder",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }
    
    try {
      setIsProcessing(true);
      
      // Get folder details to verify ownership
      const { data: folderData, error: fetchFolderError } = await supabase
        .from('file_folders')
        .select('folder_id, creator_id')
        .eq('folder_id', folderId)
        .eq('creator_id', creatorId)
        .single();
      
      if (fetchFolderError || !folderData) {
        throw new Error(`Failed to fetch folder or folder not found: ${fetchFolderError?.message || 'Unknown error'}`);
      }
      
      // Get all files that are in this folder
      const { data: filesInFolder, error: fetchFilesError } = await supabase
        .from('media')
        .select('id, folders')
        .contains('folders', [folderId]);
      
      if (fetchFilesError) {
        throw new Error(`Failed to fetch files in folder: ${fetchFilesError.message}`);
      }
      
      // For each file, update it to remove the folder reference
      for (const file of filesInFolder || []) {
        const updatedFolders = (file.folders || []).filter(
          (folder: string) => folder !== folderId
        );
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', file.id);
        
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
        }
      }
      
      // Delete the folder from the file_folders table
      const { error: deleteFolderError } = await supabase
        .from('file_folders')
        .delete()
        .eq('folder_id', folderId)
        .eq('creator_id', creatorId);
      
      if (deleteFolderError) {
        throw new Error(`Failed to delete folder: ${deleteFolderError.message}`);
      }
      
      // Update the available folders list
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders) => 
          prevFolders.filter(folder => folder.id !== folderId)
        );
      }
      
      // If we're currently viewing this folder, switch to 'all' view
      if (setCurrentFolder) {
        setCurrentFolder('all');
      }
      
      onFilesChanged();
      
      toast({
        title: "Folder deleted",
        description: "Folder has been deleted successfully. Files are still available in All Files."
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Rename a folder
  const handleRenameFolder = async (folderId: string, newFolderName: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to rename a folder",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }
    
    try {
      setIsProcessing(true);
      
      // Update the folder name in the file_folders table
      const { error: updateError } = await supabase
        .from('file_folders')
        .update({ folder_name: newFolderName })
        .eq('folder_id', folderId)
        .eq('creator_id', creatorId);
      
      if (updateError) {
        throw new Error(`Failed to rename folder: ${updateError.message}`);
      }
      
      // Update the available folders list with the new name
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders) => 
          prevFolders.map(folder => 
            folder.id === folderId ? { ...folder, name: newFolderName } : folder
          )
        );
      }
      
      onFilesChanged();
      
      toast({
        title: "Folder renamed",
        description: `Folder has been renamed to "${newFolderName}" successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast({
        title: "Error renaming folder",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleDeleteFolder,
    handleRenameFolder,
    isProcessing
  };
};
