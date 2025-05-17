
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Folder, Category } from '@/types/fileTypes';

interface UseFileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  setAvailableCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setCurrentFolder: React.Dispatch<React.SetStateAction<string>>;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useFileOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setAvailableCategories,
  setCurrentFolder,
  setCurrentCategory
}: UseFileOperationsProps) => {
  const { toast } = useToast();
  
  // State to track local copies of folder and category data
  const [localFolders, setLocalFolders] = useState<Folder[]>([]);
  const [localCurrentFolder, setLocalCurrentFolder] = useState<string>('all');

  // Initialize local state when component mounts
  useEffect(() => {
    // This will be called whenever we need to fetch the current folders
    const fetchFoldersAndCategories = async () => {
      if (!creatorId) return;
      
      try {
        // Fetch folders from the database
        const { data: folderData, error: folderError } = await supabase
          .from('file_categories')
          .select('*')
          .eq('creator_id', creatorId);
          
        if (folderError) {
          console.error("Error fetching folders:", folderError);
          return;
        }
        
        // Convert to Folder type and save locally
        const folders: Folder[] = (folderData || []).map(folder => ({
          id: folder.id,
          name: folder.name,
          categoryId: folder.creator_id || ''
        }));
        
        setLocalFolders(folders);
      } catch (err) {
        console.error("Error in fetchFoldersAndCategories:", err);
      }
    };
    
    fetchFoldersAndCategories();
  }, [creatorId]);

  // Create a new category
  const handleCreateCategory = async (categoryName: string) => {
    if (!creatorId || !categoryName) {
      return;
    }
    
    try {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Check if category already exists - FIXED: using .select() instead of .single()
      const { data: existingCategory, error: checkError } = await supabase
        .from('file_categories')
        .select('*')
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
      if (checkError) {
        console.error("Error checking category existence:", checkError);
        throw new Error("Failed to check if category exists");
      }
      
      // Check if any rows were returned
      if (existingCategory && existingCategory.length > 0) {
        toast({
          title: "Category already exists",
          description: "A category with that name already exists",
          variant: "destructive"
        });
        return;
      }
      
      // Create the category entry
      const { error: categoryError } = await supabase
        .from('file_categories')
        .insert({
          id: categoryId,
          name: categoryName,
          creator_id: creatorId
        });
      
      if (categoryError) {
        console.error("Error creating category:", categoryError);
        throw categoryError;
      }
      
      // Add the new category to the available categories
      setAvailableCategories(prevCategories => [
        ...prevCategories, 
        { id: categoryId, name: categoryName }
      ]);
      
      // Switch to the new category
      setCurrentCategory(categoryId);
      
      toast({
        title: "Category created",
        description: `Created category: ${categoryName}`,
      });
      
      // Refetch the files
      onFilesChanged();
      
    } catch (err) {
      console.error("Error in handleCreateCategory:", err);
      toast({
        title: "Error creating category",
        description: "Failed to create category",
        variant: "destructive"
      });
      throw err;
    }
  };

  // Updated to accept categoryId for creating a folder within a category
  const handleCreateFolder = async (folderName: string, fileIds: string[], categoryId: string) => {
    if (!creatorId || !folderName || !categoryId) {
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
      }
      
      // Add the selected files to the new folder and category by updating their folders and categories arrays
      for (const fileId of fileIds) {
        // Get the current file to access its folders array and categories array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders, categories')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array with the new folder ID
        const currentFolders = fileData?.folders || [];
        // Create a new categories array with the new category ID
        const currentCategories = fileData?.categories || [];
        
        // Skip if folder ID is already in the array
        if (currentFolders.includes(folderId)) {
          console.log(`File ${fileId} is already in folder ${folderId}`);
          continue;
        }
        
        // Add folder ID
        const updatedFolders = [...currentFolders, folderId];
        
        // Add category ID if not already there
        let updatedCategories = currentCategories;
        if (!currentCategories.includes(categoryId)) {
          updatedCategories = [...currentCategories, categoryId];
        }
        
        // Update the file with the new folders and categories arrays
        const { error: updateError } = await supabase
          .from('media')
          .update({ 
            folders: updatedFolders,
            categories: updatedCategories
          })
          .eq('id', fileId);
          
        if (updateError) {
          console.error(`Error adding file ${fileId} to folder:`, updateError);
        }
      }
      
      // Add the new folder to the available folders
      setAvailableFolders(prevFolders => [
        ...prevFolders, 
        { 
          id: folderId, 
          name: folderName,
          categoryId: categoryId
        }
      ]);
      
      // Update local state
      setLocalFolders(prevFolders => [
        ...prevFolders,
        {
          id: folderId, 
          name: folderName,
          categoryId: categoryId
        }
      ]);
      
      // Switch to the new folder
      setCurrentFolder(folderId);
      setLocalCurrentFolder(folderId);
      setCurrentCategory(categoryId);
      
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
      throw err;
    }
  };
  
  const handleDeleteCategory = async (categoryId: string): Promise<void> => {
    if (!creatorId || !categoryId) return Promise.reject("Missing creator or category ID");
    
    try {
      // Get all folders in this category
      const foldersInCategory = localFolders.filter(folder => folder.categoryId === categoryId);
      
      // First, remove this category from all files that reference it
      const { data: filesInCategory, error: filesError } = await supabase
        .from('media')
        .select('id, categories, folders')
        .filter('creator_id', 'eq', creatorId)
        .filter('categories', 'cs', `{"${categoryId}"}`); // Find files with this category in the array
        
      if (filesError) {
        console.error("Error fetching files in category:", filesError);
        throw filesError;
      }
      
      console.log(`Found ${filesInCategory?.length || 0} files in category ${categoryId} to update`);
      
      // Update each file to remove this category from its categories array and related folders
      for (const file of filesInCategory || []) {
        const updatedCategories = (file.categories || []).filter(c => c !== categoryId);
        // Remove folders that belong to this category
        const updatedFolders = (file.folders || []).filter(f => {
          const folder = localFolders.find(prevF => prevF.id === f);
          return !folder || folder.categoryId !== categoryId;
        });
        
        console.log(`Updating file ${file.id}: removing category ${categoryId}, new categories:`, updatedCategories);
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ 
            categories: updatedCategories,
            folders: updatedFolders
          })
          .eq('id', file.id);
          
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
        }
      }
      
      // Delete the category from the database
      const { error: deleteError } = await supabase
        .from('file_categories')
        .delete()
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
      if (deleteError) {
        console.error("Error deleting category:", deleteError);
        throw deleteError;
      }
      
      // Update the UI by removing the category and its folders
      setAvailableCategories(prevCategories => 
        prevCategories.filter(category => category.id !== categoryId)
      );
      
      setAvailableFolders(prevFolders => 
        prevFolders.filter(folder => folder.categoryId !== categoryId)
      );
      
      // Update local state
      setLocalFolders(prevFolders => 
        prevFolders.filter(folder => folder.categoryId !== categoryId)
      );
      
      // If the current category is the one being deleted, switch to 'all'
      setCurrentCategory(prevCategory => prevCategory === categoryId ? null : prevCategory);
      setCurrentFolder('all');
      setLocalCurrentFolder('all');
      
      // Refresh the files list to reflect the changes
      onFilesChanged();
      
      // Show success message
      toast({
        title: "Category deleted",
        description: "Category and all its folders have been deleted",
      });
      
      return Promise.resolve();
      
    } catch (err) {
      console.error("Error in handleDeleteCategory:", err);
      return Promise.reject(err);
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
        }
      }
      
      // Delete the folder marker file in storage
      const { error: deleteError } = await supabase.storage
        .from('creator_files')
        .remove([`${creatorId}/${folderId}/.folder`]);
      
      if (deleteError && !deleteError.message.includes('Object not found')) {
        console.error("Error deleting folder:", deleteError);
      }
      
      // Get the categoryId of the folder being deleted
      const folderToDelete = localFolders.find(folder => folder.id === folderId);
      
      // Update the UI by removing the folder from availableFolders
      setAvailableFolders(prevFolders => 
        prevFolders.filter(folder => folder.id !== folderId)
      );
      
      // Update local state
      setLocalFolders(prevFolders => 
        prevFolders.filter(folder => folder.id !== folderId)
      );
      
      // If the current folder is the one being deleted, switch to 'all' or the parent category
      if (folderId === localCurrentFolder) {
        if (folderToDelete?.categoryId) {
          setCurrentCategory(folderToDelete.categoryId);
        } else {
          setCurrentCategory(null);
        }
        setCurrentFolder('all');
        setLocalCurrentFolder('all');
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
  
  // Update this function to add files to a folder and category
  const handleAddFilesToFolder = async (fileIds: string[], targetFolderId: string, categoryId: string) => {
    if (!creatorId || !targetFolderId || !categoryId || fileIds.length === 0) return;
    
    try {
      // Update each file's folders and categories arrays
      for (const fileId of fileIds) {
        // Get the current file to access its folders and categories arrays
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders, categories')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array with the new folder ID
        const currentFolders = fileData?.folders || [];
        const currentCategories = fileData?.categories || [];
        
        // Skip if folder ID is already in the array
        if (currentFolders.includes(targetFolderId)) {
          console.log(`File ${fileId} is already in folder ${targetFolderId}`);
          continue;
        }
        
        // Add the folder ID
        const updatedFolders = [...currentFolders, targetFolderId];
        
        // Add the category ID if not already present
        let updatedCategories = currentCategories;
        if (!currentCategories.includes(categoryId)) {
          updatedCategories = [...currentCategories, categoryId];
        }
        
        // Update the file with the new folders and categories arrays
        const { error: updateError } = await supabase
          .from('media')
          .update({ 
            folders: updatedFolders,
            categories: updatedCategories
          })
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
  
  // Function to remove files from a folder
  const handleRemoveFromFolder = async (fileIds: string[], folderId: string) => {
    if (!creatorId || !folderId || fileIds.length === 0 || folderId === 'all' || folderId === 'unsorted') {
      return;
    }
    
    try {
      console.log(`Removing ${fileIds.length} files from folder ${folderId}`);
      
      // Find the category ID for this folder
      let categoryId = null;
      const folder = localFolders.find(folder => folder.id === folderId);
      if (folder) {
        categoryId = folder.categoryId;
      }
      
      // Update each file's folders array to remove the folderId
      for (const fileId of fileIds) {
        // Get the current file to access its folders array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders, categories')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array without the target folder ID
        const currentFolders = fileData?.folders || [];
        const updatedFolders = currentFolders.filter(folder => folder !== folderId);
        
        // Check if we should also remove the category
        const currentCategories = fileData?.categories || [];
        let updatedCategories = currentCategories;
        
        if (categoryId) {
          // Check if this file is in any other folder of this category
          const hasOtherFoldersInCategory = updatedFolders.some(fId => {
            const f = localFolders.find(folder => folder.id === fId);
            return f && f.categoryId === categoryId;
          });
          
          // If not in any other folder in this category, remove the category too
          if (!hasOtherFoldersInCategory) {
            updatedCategories = currentCategories.filter(cat => cat !== categoryId);
          }
        }
        
        console.log(`File ${fileId}: Removing folder ${folderId}, updated folders:`, updatedFolders);
        
        // Update the file with the new folders array and possibly updated categories
        const { error: updateError } = await supabase
          .from('media')
          .update({ 
            folders: updatedFolders,
            categories: updatedCategories
          })
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

  // Function to rename a folder
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
      
      // Get the categoryId for this folder
      const folder = localFolders.find(folder => folder.id === folderId);
      const categoryId = folder?.categoryId;
      
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
          folder.id === folderId ? { id: newFolderId, name: newFolderName, categoryId: categoryId || '' } : folder
        )
      );
      
      // Update local state
      setLocalFolders(prevFolders => 
        prevFolders.map(folder => 
          folder.id === folderId ? { id: newFolderId, name: newFolderName, categoryId: categoryId || '' } : folder
        )
      );
      
      // If the current folder is the one being renamed, switch to the new folder
      setCurrentFolder(prevFolder => prevFolder === folderId ? newFolderId : prevFolder);
      setLocalCurrentFolder(prevFolder => prevFolder === folderId ? newFolderId : prevFolder);
      
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

  // Function to rename a category
  const handleRenameCategory = async (categoryId: string, newCategoryName: string): Promise<void> => {
    if (!creatorId || !categoryId || !newCategoryName) {
      return Promise.reject("Missing required parameters");
    }

    try {
      console.log(`Renaming category ${categoryId} to ${newCategoryName}`);
      
      // Create a new category ID based on the new name
      const newCategoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      
      // Skip if the category ID would remain the same
      if (categoryId === newCategoryId) {
        toast({
          title: "No changes made",
          description: "The new category name would result in the same category ID."
        });
        return Promise.resolve();
      }
      
      // Check if the new category ID already exists
      const { data: existingCategory, error: checkError } = await supabase
        .from('file_categories')
        .select('*')
        .eq('id', newCategoryId)
        .eq('creator_id', creatorId)
        .single();
      
      if (checkError && !checkError.message.includes('No rows found')) {
        console.error("Error checking category existence:", checkError);
        throw new Error("Failed to check if category exists");
      }
      
      if (existingCategory) {
        toast({
          title: "Category already exists",
          description: "A category with that name already exists",
          variant: "destructive"
        });
        return Promise.reject(new Error("Category already exists"));
      }
      
      // Get all files in the old category
      const { data: filesInCategory, error: filesError } = await supabase
        .from('media')
        .select('id, categories')
        .filter('creator_id', 'eq', creatorId)
        .filter('categories', 'cs', `{"${categoryId}"}`);
        
      if (filesError) {
        console.error("Error fetching files in category:", filesError);
        throw filesError;
      }
      
      console.log(`Found ${filesInCategory?.length || 0} files in category ${categoryId} to update`);
      
      // For each file in the old category, replace the old category ID with the new one
      for (const file of filesInCategory || []) {
        const updatedCategories = (file.categories || []).map(c => c === categoryId ? newCategoryId : c);
        
        console.log(`Updating file ${file.id}: replacing category ${categoryId} with ${newCategoryId}, new categories:`, updatedCategories);
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ categories: updatedCategories })
          .eq('id', file.id);
          
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
        }
      }

      // Create a new category entry in the database
      const { error: createError } = await supabase
        .from('file_categories')
        .insert({
          id: newCategoryId,
          name: newCategoryName,
          creator_id: creatorId
        });
      
      if (createError) {
        console.error("Error creating new category:", createError);
        throw createError;
      }
      
      // Delete the old category
      const { error: deleteError } = await supabase
        .from('file_categories')
        .delete()
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
      if (deleteError) {
        console.error("Error deleting old category:", deleteError);
        throw deleteError;
      }
      
      // Update all folders that belong to this category
      setAvailableFolders(prevFolders => {
        const updatedFolders = prevFolders.map(folder => 
          folder.categoryId === categoryId ? { ...folder, categoryId: newCategoryId } : folder
        );
        
        // For each affected folder, we need to update the files
        updatedFolders
          .filter(folder => folder.categoryId === newCategoryId)
          .forEach(async folder => {
            const { data: filesInFolder, error: folderFilesError } = await supabase
              .from('media')
              .select('id, categories')
              .filter('creator_id', 'eq', creatorId)
              .filter('folders', 'cs', `{"${folder.id}"}`);
              
            if (folderFilesError) {
              console.error(`Error fetching files in folder ${folder.id}:`, folderFilesError);
              return;
            }
            
            // Update each file to use the new category ID
            for (const file of filesInFolder || []) {
              const currentCategories = file.categories || [];
              const updatedCategories = currentCategories.map(c => c === categoryId ? newCategoryId : c);
              
              // Skip if no changes
              if (JSON.stringify(currentCategories) === JSON.stringify(updatedCategories)) {
                continue;
              }
              
              const { error: updateError } = await supabase
                .from('media')
                .update({ categories: updatedCategories })
                .eq('id', file.id);
                
              if (updateError) {
                console.error(`Error updating file ${file.id} categories:`, updateError);
              }
            }
          });
        
        return updatedFolders;
      });
      
      // Update local state
      setLocalFolders(prevFolders => {
        return prevFolders.map(folder => 
          folder.categoryId === categoryId ? { ...folder, categoryId: newCategoryId } : folder
        );
      });
      
      // Update the UI by replacing the category in availableCategories
      setAvailableCategories(prevCategories => 
        prevCategories.map(category => 
          category.id === categoryId ? { id: newCategoryId, name: newCategoryName } : category
        )
      );
      
      // If the current category is the one being renamed, switch to the new category
      setCurrentCategory(prevCategory => prevCategory === categoryId ? newCategoryId : prevCategory);
      
      // Refresh the files list to reflect the changes
      onFilesChanged();
      
      // Show success message
      toast({
        title: "Category renamed",
        description: `Successfully renamed category to "${newCategoryName}"`,
      });
      
      return Promise.resolve();
      
    } catch (err) {
      console.error("Error in handleRenameCategory:", err);
      toast({
        variant: "destructive",
        title: "Error renaming category",
        description: err instanceof Error ? err.message : "Failed to rename category"
      });
      return Promise.reject(err);
    }
  };

  return {
    handleCreateCategory,
    handleCreateFolder,
    handleDeleteCategory,
    handleDeleteFolder,
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory
  };
};
