
import { useCategoryOperations } from './useCategoryOperations';
import { useCreateOperations } from './useCreateOperations';
import { useFolderOperations } from './useFolderOperations';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';

interface FileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders: (folders: any[]) => void;
  setAvailableCategories: (categories: any[]) => void;
  setCurrentFolder: (folderId: string) => void;
  setCurrentCategory: (categoryId: string | null) => void;
}

export const useFileOperations = ({
  creatorId,
  onFilesChanged,
  setAvailableFolders,
  setAvailableCategories,
  setCurrentFolder,
  setCurrentCategory
}: FileOperationsProps) => {
  const { handleCreateFolder, handleCreateCategory } = useCreateOperations({
    creatorId,
    onFilesChanged,
    setAvailableFolders,
    setAvailableCategories
  });
  
  const { 
    handleDeleteFolder, 
    handleDeleteCategory 
  } = useCategoryOperations({
    creatorId,
    onFilesChanged,
    setAvailableFolders,
    setAvailableCategories,
    setCurrentFolder,
    setCurrentCategory
  });
  
  const {
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory
  } = useFolderOperations({
    creatorId,
    onFilesChanged,
    setAvailableFolders,
    setAvailableCategories
  });

  // Add a function to handle adding tags to files
  const handleAddTagToFiles = async (fileIds: string[], tagId: string) => {
    if (!creatorId || !fileIds.length) return;
    
    try {
      // In a real implementation, this would update the database
      // For now, we're using a simulated approach with the Supabase client
      
      // First get the existing files to update their tags
      const { data: existingFiles, error: fetchError } = await supabase
        .from('media')
        .select('id, tags')
        .in('id', fileIds);
      
      if (fetchError) throw fetchError;
      
      // Update each file with the new tag
      for (const file of existingFiles || []) {
        const currentTags = file.tags || [];
        // Only add the tag if it's not already there
        if (!currentTags.includes(tagId)) {
          const updatedTags = [...currentTags, tagId];
          
          await supabase
            .from('media')
            .update({ tags: updatedTags })
            .eq('id', file.id);
        }
      }
      
      // Refresh the file list
      onFilesChanged();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding tag to files:", error);
      return Promise.reject(error);
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
    handleAddTagToFiles
  };
};
