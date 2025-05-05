
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
  const handleCreateFolder = async (folderName: string, fileIds: string[]) => {
    if (!creatorId || !folderName || fileIds.length === 0) {
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
      
      // Add the new folder to the available folders
      setAvailableFolders(prevFolders => [
        ...prevFolders, 
        { id: folderId, name: folderName }
      ]);
      
      // Switch to the new folder
      setCurrentFolder(folderId);
      
      toast({
        title: "Folder created",
        description: `Created folder: ${folderName}`,
      });
      
      // Refetch the files
      onFilesChanged();
      
    } catch (err) {
      console.error("Error in handleCreateFolder:", err);
      toast({
        title: "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
      throw err; // Re-throw to let the caller handle it
    }
  };
  
  const handleDeleteFolder = async (folderId: string): Promise<void> => {
    if (!creatorId || !folderId) return Promise.reject("Missing creator or folder ID");
    
    try {
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
      
      // If the current folder is the one being deleted, switch to 'all' instead of 'shared'
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

  return {
    handleCreateFolder,
    handleDeleteFolder,
    handleAddFilesToFolder,
    handleRemoveFromFolder
  };
};
