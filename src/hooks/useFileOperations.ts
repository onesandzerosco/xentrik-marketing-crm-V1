
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Category, Folder } from '@/types/fileTypes';

interface FileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders?: (folders: Folder[]) => void;
  setAvailableCategories?: (categories: Category[]) => void;
  setCurrentFolder?: (folderId: string) => void;
  setCurrentCategory?: (categoryId: string | null) => void;
}

export const useFileOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setAvailableCategories,
  setCurrentFolder,
  setCurrentCategory
}: FileOperationsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Create a new folder and optionally add files to it
  const handleCreateFolder = async (folderName: string, fileIds: string[], categoryId: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to create a folder",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }

    try {
      setIsProcessing(true);
      
      // Generate a folder ID that is URL-friendly
      const folderId = folderName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 8);
      
      // Update all selected files to add them to this folder
      if (fileIds.length > 0) {
        // Get existing folders for each file first then append the new folder
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
          
          const updatedFolders = [...(fileData.folders || []), folderId];
          
          const { error: updateError } = await supabase
            .from('media')
            .update({ folders: updatedFolders })
            .eq('id', fileId);
          
          if (updateError) {
            console.error(`Error updating file ${fileId}:`, updateError);
          }
        }
      }
      
      // Add the new folder to the available folders
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders: Folder[]) => [
          ...prevFolders,
          { id: folderId, name: folderName, categoryId }
        ]);
      }
      
      // Set the current folder to the newly created folder
      if (setCurrentFolder) {
        setCurrentFolder(folderId);
      }
      
      onFilesChanged();
      
      toast({
        title: "Folder created",
        description: `${folderName} folder has been created successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Create a new category
  const handleCreateCategory = async (categoryName: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to create a category",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }
    
    try {
      setIsProcessing(true);
      
      // Generate a unique ID for the category
      const categoryId = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + uuidv4().slice(0, 8);
      
      // Insert the new category into the database
      const { error: categoryError } = await supabase
        .from('file_categories')
        .insert({
          id: categoryId,
          name: categoryName,
          creator_id: creatorId
        });
      
      if (categoryError) {
        throw new Error(`Failed to create category: ${categoryError.message}`);
      }
      
      // Add the new category to the available categories
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories: Category[]) => [
          ...prevCategories,
          { id: categoryId, name: categoryName }
        ]);
      }
      
      // Set the current category to the newly created category
      if (setCurrentCategory) {
        setCurrentCategory(categoryId);
      }
      
      toast({
        title: "Category created",
        description: `${categoryName} category has been created successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error creating category:", error);
      toast({
        title: "Error creating category",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

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
      
      // Get all files that are in this folder
      const { data: filesInFolder, error: fetchError } = await supabase
        .from('media')
        .select('id, folders')
        .contains('folders', [folderId]);
      
      if (fetchError) {
        throw new Error(`Failed to fetch files in folder: ${fetchError.message}`);
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
      
      // Update the available folders list
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders: Folder[]) => 
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
      
      // Update the available folders list with the new name
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders: Folder[]) => 
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

  // Delete a category
  const handleDeleteCategory = async (categoryId: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to delete a category",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }
    
    try {
      setIsProcessing(true);
      
      // Get all files that are in this category
      const { data: filesInCategory, error: fetchFilesError } = await supabase
        .from('media')
        .select('id, categories')
        .contains('categories', [categoryId]);
      
      if (fetchFilesError) {
        throw new Error(`Failed to fetch files in category: ${fetchFilesError.message}`);
      }
      
      // For each file, update it to remove the category reference
      for (const file of filesInCategory || []) {
        const updatedCategories = (file.categories || []).filter(
          (category: string) => category !== categoryId
        );
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ categories: updatedCategories })
          .eq('id', file.id);
        
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
        }
      }
      
      // Update folders that belong to this category
      let foldersToUpdate: Folder[] = [];
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders: Folder[]) => {
          // Get the list of folders in this category
          const foldersInCategory = prevFolders.filter(folder => folder.categoryId === categoryId);
          foldersToUpdate = foldersInCategory;
          
          // Return folders not in this category
          return prevFolders.filter(folder => folder.categoryId !== categoryId);
        });
      }
      
      // Delete the category from the database
      const { error: deleteCategoryError } = await supabase
        .from('file_categories')
        .delete()
        .eq('id', categoryId);
      
      if (deleteCategoryError) {
        throw new Error(`Failed to delete category: ${deleteCategoryError.message}`);
      }
      
      // Update the available categories list
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories: Category[]) => 
          prevCategories.filter(category => category.id !== categoryId)
        );
      }
      
      // If we're currently viewing this category, switch to no category view
      if (setCurrentCategory) {
        setCurrentCategory(null);
      }
      
      onFilesChanged();
      
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully. Associated folders have been removed as well."
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error deleting category",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Rename a category
  const handleRenameCategory = async (categoryId: string, newCategoryName: string): Promise<void> => {
    if (!creatorId) {
      toast({
        title: "Error",
        description: "Creator ID is required to rename a category",
        variant: "destructive"
      });
      return Promise.reject("Creator ID is required");
    }
    
    try {
      setIsProcessing(true);
      
      // Update the category name in the database
      const { error: updateError } = await supabase
        .from('file_categories')
        .update({ name: newCategoryName })
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
      if (updateError) {
        throw new Error(`Failed to rename category: ${updateError.message}`);
      }
      
      // Update the available categories list with the new name
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories: Category[]) => 
          prevCategories.map(category => 
            category.id === categoryId ? { ...category, name: newCategoryName } : category
          )
        );
      }
      
      onFilesChanged();
      
      toast({
        title: "Category renamed",
        description: `Category has been renamed to "${newCategoryName}" successfully`
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error renaming category:", error);
      toast({
        title: "Error renaming category",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      return Promise.reject(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleCreateFolder,
    handleCreateCategory,
    handleDeleteFolder,
    handleDeleteCategory,
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory,
    isProcessing
  };
};
