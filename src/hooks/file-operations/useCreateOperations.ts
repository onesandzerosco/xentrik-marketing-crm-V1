
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Category, Folder } from '@/types/fileTypes';

interface CreateOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders?: React.Dispatch<React.SetStateAction<Folder[]>>;
  setAvailableCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  setCurrentFolder?: (folderId: string) => void;
  setCurrentCategory?: (categoryId: string | null) => void;
}

export const useCreateOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setAvailableCategories,
  setCurrentFolder,
  setCurrentCategory
}: CreateOperationsProps) => {
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
      
      // Insert the new folder into the file_folders table
      const { data: folderData, error: folderError } = await supabase
        .from('file_folders')
        .insert({
          folder_name: folderName,
          category_id: categoryId,
          creator_id: creatorId
        })
        .select('folder_id, folder_name, category_id')
        .single();
      
      if (folderError) {
        throw new Error(`Failed to create folder: ${folderError.message}`);
      }
      
      // Update all selected files to add them to this folder
      if (fileIds.length > 0) {
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
          
          const updatedFolders = [...(fileData.folders || []), folderData.folder_id];
          
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
      if (setAvailableFolders && folderData) {
        setAvailableFolders((prevFolders) => [
          ...prevFolders,
          { 
            id: folderData.folder_id, 
            name: folderData.folder_name, 
            categoryId: folderData.category_id 
          }
        ]);
      }
      
      // Set the current folder to the newly created folder
      if (setCurrentFolder && folderData) {
        setCurrentFolder(folderData.folder_id);
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
      
      // Insert the new category into the file_categories table
      const { data: categoryData, error: categoryError } = await supabase
        .from('file_categories')
        .insert({
          category_name: categoryName,
          creator: creatorId
        })
        .select('category_id, category_name')
        .single();
      
      if (categoryError) {
        throw new Error(`Failed to create category: ${categoryError.message}`);
      }
      
      // Add the new category to the available categories
      if (setAvailableCategories && categoryData) {
        setAvailableCategories((prevCategories) => [
          ...prevCategories,
          { id: categoryData.category_id, name: categoryData.category_name }
        ]);
      }
      
      // Set the current category to the newly created category
      if (setCurrentCategory && categoryData) {
        setCurrentCategory(categoryData.category_id);
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

  return {
    handleCreateFolder,
    handleCreateCategory,
    isProcessing
  };
};
