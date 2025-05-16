
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Folder } from '@/types/fileTypes';

interface UseFileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setCurrentFolder: React.Dispatch<React.SetStateAction<string>>;
}

export const useFileOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setCurrentFolder
}: UseFileOperationsProps) => {
  const { toast } = useToast();

  // Updated to accept fileIds for creating a folder with files already in it
  // Added parentId and isCategory parameters for nested folders
  const handleCreateFolder = async (
    folderName: string, 
    fileIds: string[], 
    parentId: string | null = null, 
    isCategory: boolean = false
  ) => {
    if (!creatorId || !folderName) {
      return;
    }
    
    try {
      const folderId = folderName.toLowerCase().replace(/\s+/g, '-');
      
      // Create an empty file in the folder to "create" the folder in storage
      const { error: storageError } = await supabase.storage
        .from('creator_files')
        .upload(`${creatorId}/${folderId}/.folder`, new Blob(['']));
      
      if (storageError) {
        console.error("Error creating folder in storage:", storageError);
        toast({
          title: "Warning",
          description: "Created folder in database but storage folder creation failed. Some features may be limited.",
          variant: "destructive"
        });
        // Continue anyway as we're now primarily using the database for folder tracking
      }
      
      // Add files to the folder if any are selected
      if (fileIds && fileIds.length > 0) {
        // Add the selected files to the new folder by updating their folders array
        for (const fileId of fileIds) {
          // Get the current file to access its folders array
          const { data: fileData, error: fetchError } = await supabase
            .from('media')
            .select('folders')
            .eq('id', fileId)
            .single();
            
          if (fetchError) {
            console.error(`Error fetching file ${fileId}:`, fetchError);
            continue;
          }
          
          // Create a new folders array with the new folder ID
          const currentFolders = fileData?.folders || [];
          
          // Skip if folder ID is already in the array
          if (currentFolders.includes(folderId)) {
            console.log(`File ${fileId} is already in folder ${folderId}`);
            continue;
          }
          
          const updatedFolders = [...currentFolders, folderId];
          
          // Update the file with the new folders array
          const { error: updateError } = await supabase
            .from('media')
            .update({ folders: updatedFolders })
            .eq('id', fileId);
            
          if (updateError) {
            console.error(`Error adding file ${fileId} to folder:`, updateError);
          }
        }
      }
      
      // Add the new folder to the available folders with parent info if applicable
      setAvailableFolders(prevFolders => [
        ...prevFolders, 
        { 
          id: folderId, 
          name: folderName, 
          parentId: parentId,
          isCategory: isCategory
        }
      ]);
      
      // Switch to the new folder if it's not a category
      if (!isCategory) {
        setCurrentFolder(folderId);
      }
      
      toast({
        title: isCategory ? "Category created" : "Folder created",
        description: `Created ${isCategory ? 'category' : 'folder'}: ${folderName}`,
      });
      
      // Refetch the files
      onFilesChanged();
      
    } catch (err) {
      console.error("Error in handleCreateFolder:", err);
      toast({
        title: isCategory ? "Error creating category" : "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
      throw err; // Re-throw to let the caller handle it
    }
  };
  
  // Updated for nested folders: check for child folders before deleting
  const handleDeleteFolder = async (folderId: string): Promise<void> => {
    if (!creatorId || !folderId) return Promise.reject("Missing creator or folder ID");
    
    try {
      // Check if this folder has child folders
      const hasChildFolders = await checkForChildFolders(folderId);
      
      if (hasChildFolders) {
        toast({
          title: "Cannot delete folder",
          description: "This folder contains subfolders. Please delete all subfolders first.",
          variant: "destructive"
        });
        return Promise.reject("Folder contains subfolders");
      }
      
      // First, remove this folder from all files that reference it
      const { data: filesInFolder, error: filesError } = await supabase
        .from('media')
        .select('id, folders')
        .filter('creator_id', 'eq', creatorId)
        .filter('folders', 'cs', `{"${folderId}"}`); // Find files with this folder in the array
        
      if (filesError) {
        console.error("Error fetching files in folder:", filesError);
        throw filesError;
      }
      
      console.log(`Found ${filesInFolder?.length || 0} files in folder ${folderId} to update`);
      
      // Update each file to remove this folder from its folders array
      for (const file of filesInFolder || []) {
        const updatedFolders = (file.folders || []).filter(f => f !== folderId);
        
        console.log(`Updating file ${file.id}: removing folder ${folderId}, new folders:`, updatedFolders);
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', file.id);
          
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
          // Continue with other files even if one update fails
        }
      }
      
      // Delete the folder marker file in storage
      const { error: deleteError } = await supabase.storage
        .from('creator_files')
        .remove([`${creatorId}/${folderId}/.folder`]);
      
      if (deleteError && !deleteError.message.includes('Object not found')) {
        console.error("Error deleting folder:", deleteError);
        // Don't throw here, continue with UI update even if storage deletion fails
      }
      
      // Update the UI by removing the folder from availableFolders
      setAvailableFolders(prevFolders => 
        prevFolders.filter(folder => folder.id !== folderId)
      );
      
      // If the current folder is the one being deleted, switch to 'all'
      if (folderId === folderId) {
        setCurrentFolder('all');
      }
      
      // Refresh the files list to reflect the changes
      onFilesChanged();
      
      // Show success message
      toast({
        title: "Folder deleted",
        description: "Files have been moved to Unsorted Uploads",
      });
      
      return Promise.resolve();
      
    } catch (err) {
      console.error("Error in handleDeleteFolder:", err);
      return Promise.reject(err);
    }
  };
  
  // Helper function to check if a folder has child folders
  const checkForChildFolders = async (folderId: string): Promise<boolean> => {
    try {
      const hasChildren = await new Promise<boolean>(resolve => {
        setAvailableFolders(prevFolders => {
          const childFolders = prevFolders.filter(folder => folder.parentId === folderId);
          resolve(childFolders.length > 0);
          return prevFolders;
        });
      });
      
      return hasChildren;
    } catch (error) {
      console.error("Error checking for child folders:", error);
      return false;
    }
  };
  
  // Update this function to add folders to the file's folders array
  const handleAddFilesToFolder = async (fileIds: string[], targetFolderId: string) => {
    if (!creatorId || !targetFolderId || fileIds.length === 0) return;
    
    try {
      // Update each file's folders array to include the targetFolderId
      for (const fileId of fileIds) {
        // Get the current file to access its folders array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array with the new folder ID
        const currentFolders = fileData?.folders || [];
        
        // Skip if folder ID is already in the array
        if (currentFolders.includes(targetFolderId)) {
          console.log(`File ${fileId} is already in folder ${targetFolderId}`);
          continue;
        }
        
        const updatedFolders = [...currentFolders, targetFolderId];
        
        // Update the file with the new folders array
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', fileId);
          
        if (updateError) {
          console.error(`Error adding file ${fileId} to folder:`, updateError);
        }
      }
      
      // Refresh the files list
      onFilesChanged();
      
    } catch (err) {
      console.error("Error in handleAddFilesToFolder:", err);
      throw err;
    }
  };
  
  // New function to remove files from a folder
  const handleRemoveFromFolder = async (fileIds: string[], folderId: string) => {
    if (!creatorId || !folderId || fileIds.length === 0 || folderId === 'all' || folderId === 'unsorted') {
      return;
    }
    
    try {
      console.log(`Removing ${fileIds.length} files from folder ${folderId}`);
      
      // Update each file's folders array to remove the folderId
      for (const fileId of fileIds) {
        // Get the current file to access its folders array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array without the target folder ID
        const currentFolders = fileData?.folders || [];
        const updatedFolders = currentFolders.filter(folder => folder !== folderId);
        
        console.log(`File ${fileId}: Removing folder ${folderId}, updated folders:`, updatedFolders);
        
        // Update the file with the new folders array
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', fileId);
          
        if (updateError) {
          console.error(`Error updating file ${fileId}:`, updateError);
          throw updateError;
        }
      }
      
      // Refresh the files list
      onFilesChanged();
      
    } catch (err) {
      console.error("Error in handleRemoveFromFolder:", err);
      throw err;
    }
  };

  // Updated rename folder function to preserve parent relationship
  const handleRenameFolder = async (folderId: string, newFolderName: string): Promise<void> => {
    if (!creatorId || !folderId || !newFolderName) {
      return Promise.reject("Missing required parameters");
    }

    try {
      console.log(`Renaming folder ${folderId} to ${newFolderName}`);
      
      // Create a new folder ID based on the new name
      const newFolderId = newFolderName.toLowerCase().replace(/\s+/g, '-');
      
      // Skip if the folder ID would remain the same
      if (folderId === newFolderId) {
        toast({
          title: "No changes made",
          description: "The new folder name would result in the same folder ID."
        });
        return Promise.resolve();
      }
      
      // Get the current folder to preserve parentId and isCategory
      let parentId = null;
      let isCategory = false;
      
      await new Promise<void>(resolve => {
        setAvailableFolders(prevFolders => {
          const folderToRename = prevFolders.find(f => f.id === folderId);
          if (folderToRename) {
            parentId = folderToRename.parentId || null;
            isCategory = folderToRename.isCategory || false;
          }
          resolve();
          return prevFolders;
        });
      });
      
      // Also update any folders that have this folder as parent
      await new Promise<void>(resolve => {
        setAvailableFolders(prevFolders => {
          const updatedFolders = prevFolders.map(folder => {
            if (folder.parentId === folderId) {
              return { ...folder, parentId: newFolderId };
            }
            return folder;
          });
          resolve();
          return updatedFolders;
        });
      });
      
      // Get all files in the old folder
      const { data: filesInFolder, error: filesError } = await supabase
        .from('media')
        .select('id, folders')
        .filter('creator_id', 'eq', creatorId)
        .filter('folders', 'cs', `{"${folderId}"}`);
        
      if (filesError) {
        console.error("Error fetching files in folder:", filesError);
        throw filesError;
      }
      
      console.log(`Found ${filesInFolder?.length || 0} files in folder ${folderId} to update`);
      
      // For each file in the old folder, replace the old folder ID with the new one
      for (const file of filesInFolder || []) {
        const updatedFolders = (file.folders || []).map(f => f === folderId ? newFolderId : f);
        
        console.log(`Updating file ${file.id}: replacing folder ${folderId} with ${newFolderId}, new folders:`, updatedFolders);
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', file.id);
          
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
          // Continue with other files even if one update fails
        }
      }

      // Create a new folder marker file using the new ID
      const { error: storageError } = await supabase.storage
        .from('creator_files')
        .copy(
          `${creatorId}/${folderId}/.folder`,
          `${creatorId}/${newFolderId}/.folder`
        );
      
      if (storageError && !storageError.message.includes('Object not found')) {
        console.error("Error copying folder marker:", storageError);
        // Don't throw here, continue with UI update even if storage operation fails
        // We'll create a new marker file instead
        const { error: createError } = await supabase.storage
          .from('creator_files')
          .upload(`${creatorId}/${newFolderId}/.folder`, new Blob(['']));
          
        if (createError) {
          console.error("Error creating new folder marker:", createError);
        }
      }
      
      // Delete the old folder marker file
      await supabase.storage
        .from('creator_files')
        .remove([`${creatorId}/${folderId}/.folder`]);
      
      // Update the UI by replacing the folder in availableFolders
      setAvailableFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === folderId ? 
            { id: newFolderId, name: newFolderName, parentId, isCategory } : 
            folder
        )
      );
      
      // If the current folder is the one being renamed, switch to the new folder
      if (folderId === folderId) {
        setCurrentFolder(newFolderId);
      }
      
      // Refresh the files list to reflect the changes
      onFilesChanged();
      
      // Show success message
      toast({
        title: "Folder renamed",
        description: `Successfully renamed folder to "${newFolderName}"`,
      });
      
      return Promise.resolve();
      
    } catch (err) {
      console.error("Error in handleRenameFolder:", err);
      toast({
        variant: "destructive",
        title: "Error renaming folder",
        description: err instanceof Error ? err.message : "Failed to rename folder"
      });
      return Promise.reject(err);
    }
  };

  return {
    handleCreateFolder,
    handleDeleteFolder,
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleRenameFolder
  };
};
