
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category, Folder } from '@/types/fileTypes';

interface CategoryOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  setAvailableFolders?: React.Dispatch<React.SetStateAction<Folder[]>>;
  setCurrentCategory?: (categoryId: string | null) => void;
}

export const useCategoryOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableCategories,
  setAvailableFolders,
  setCurrentCategory
}: CategoryOperationsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
      const { data: foldersInCategory, error: fetchFoldersError } = await supabase
        .from('file_folders')
        .select('folder_id')
        .eq('category_id', categoryId);
      
      if (fetchFoldersError) {
        throw new Error(`Failed to fetch folders in category: ${fetchFoldersError.message}`);
      }
      
      const folderIds = foldersInCategory?.map(folder => folder.folder_id) || [];
      
      // For each file with folders in this category, update it to remove the folder references
      if (folderIds.length > 0) {
        const { data: filesInFolders, error: fetchFilesError } = await supabase
          .from('media')
          .select('id, folders')
          .contains('folders', folderIds);
        
        if (fetchFilesError) {
          console.error("Error fetching files in folders:", fetchFilesError);
        } else {
          // For each file, update it to remove the folder references
          for (const file of filesInFolders || []) {
            const updatedFolders = (file.folders || []).filter(
              (folder: string) => !folderIds.includes(folder)
            );
            
            const { error: updateError } = await supabase
              .from('media')
              .update({ folders: updatedFolders })
              .eq('id', file.id);
            
            if (updateError) {
              console.error(`Error updating file ${file.id}:`, updateError);
            }
          }
        }
      }
      
      // Delete the category from the file_categories table
      // This will automatically delete all associated folders due to CASCADE
      const { error: deleteCategoryError } = await supabase
        .from('file_categories')
        .delete()
        .eq('category_id', categoryId)
        .eq('creator', creatorId);
      
      if (deleteCategoryError) {
        throw new Error(`Failed to delete category: ${deleteCategoryError.message}`);
      }
      
      // Update the available categories list
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories) => 
          prevCategories.filter(category => category.id !== categoryId)
        );
      }
      
      // Update the available folders list
      if (setAvailableFolders) {
        setAvailableFolders((prevFolders) => 
          prevFolders.filter(folder => folder.categoryId !== categoryId)
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
      
      // Update the category name in the file_categories table
      const { error: updateError } = await supabase
        .from('file_categories')
        .update({ category_name: newCategoryName })
        .eq('category_id', categoryId)
        .eq('creator', creatorId);
      
      if (updateError) {
        throw new Error(`Failed to rename category: ${updateError.message}`);
      }
      
      // Update the available categories list with the new name
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories) => 
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
    handleDeleteCategory,
    handleRenameCategory,
    isProcessing
  };
};
