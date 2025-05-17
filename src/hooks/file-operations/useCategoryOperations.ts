
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/fileTypes';

interface CategoryOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  setCurrentCategory?: (categoryId: string | null) => void;
}

export const useCategoryOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableCategories,
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
      
      // First, get all folders in this category
      const { data: foldersInCategory, error: folderError } = await supabase
        .from('folders')
        .select('id')
        .eq('category_id', categoryId)
        .eq('creator_id', creatorId);
      
      if (folderError) {
        throw new Error(`Failed to fetch folders in category: ${folderError.message}`);
      }
      
      // Get all folder IDs in this category
      const folderIds = foldersInCategory?.map(folder => folder.id) || [];
      
      // If there are folders in this category, remove them from files first
      if (folderIds.length > 0) {
        // Get all files that have any of these folders
        const { data: filesWithFolders, error: fetchError } = await supabase
          .from('media')
          .select('id, folders')
          .filter('creator_id', 'eq', creatorId);
        
        if (fetchError) {
          console.error("Error fetching files with folders:", fetchError);
        } else {
          // For each file, update it to remove any folders from this category
          for (const file of filesWithFolders || []) {
            if (!file.folders || !Array.isArray(file.folders)) continue;
            
            const updatedFolders = file.folders.filter(
              (folderId: string) => !folderIds.includes(folderId)
            );
            
            if (updatedFolders.length !== file.folders.length) {
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
        
        // Delete all folders in this category
        const { error: deleteFoldersError } = await supabase
          .from('folders')
          .delete()
          .eq('category_id', categoryId)
          .eq('creator_id', creatorId);
        
        if (deleteFoldersError) {
          console.error("Error deleting folders:", deleteFoldersError);
        }
      }
      
      // Delete the category
      const { error: deleteCategoryError } = await supabase
        .from('file_categories')
        .delete()
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
      if (deleteCategoryError) {
        throw new Error(`Failed to delete category: ${deleteCategoryError.message}`);
      }
      
      // Update the available categories list
      if (setAvailableCategories) {
        setAvailableCategories((prevCategories) => 
          prevCategories.filter(category => category.id !== categoryId)
        );
      }
      
      // If we're currently viewing this category, switch to null (all categories)
      if (setCurrentCategory) {
        setCurrentCategory(null);
      }
      
      onFilesChanged();
      
      toast({
        title: "Category deleted",
        description: "Category and its folders have been deleted successfully."
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
        .update({ name: newCategoryName })
        .eq('id', categoryId)
        .eq('creator_id', creatorId);
      
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
