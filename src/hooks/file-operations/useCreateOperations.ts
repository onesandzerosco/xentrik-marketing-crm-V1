
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
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
        setAvailableFolders((prevFolders) => [
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
        setAvailableCategories((prevCategories) => [
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

  return {
    handleCreateFolder,
    handleCreateCategory,
    isProcessing
  };
};
