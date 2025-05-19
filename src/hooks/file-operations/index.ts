
import { useCreateOperations } from './useCreateOperations';
import { useCategoryOperations } from './useCategoryOperations';
import { useFolderOperations } from './useFolderOperations';
import { Category, Folder } from '@/types/fileTypes';

interface UseFileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders?: React.Dispatch<React.SetStateAction<Folder[]>>;
  setAvailableCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
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
}: UseFileOperationsProps) => {
  // Use all the individual operation hooks
  const {
    handleCreateFolder,
    handleCreateCategory
  } = useCreateOperations({
    creatorId,
    onFilesChanged,
    setAvailableFolders,
    setAvailableCategories,
    setCurrentFolder,
    setCurrentCategory
  });
  
  const {
    handleDeleteCategory,
    handleRenameCategory
  } = useCategoryOperations({
    creatorId,
    onFilesChanged,
    setAvailableCategories,
    setAvailableFolders,
    setCurrentCategory
  });
  
  const {
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleDeleteFolder,
    handleRenameFolder
  } = useFolderOperations({
    creatorId,
    onFilesChanged,
    setAvailableFolders,
    setCurrentFolder
  });
  
  return {
    // Create operations
    handleCreateFolder,
    handleCreateCategory,
    
    // Category operations
    handleDeleteCategory,
    handleRenameCategory,
    
    // Folder operations
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleDeleteFolder,
    handleRenameFolder
  };
};
