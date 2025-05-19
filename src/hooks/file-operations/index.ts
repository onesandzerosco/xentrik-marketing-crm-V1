
import { useState } from 'react';
import { Category, Folder } from '@/types/fileTypes';
import { useCreateOperations } from './useCreateOperations';
import { useFolderOperations } from './useFolderOperations';
import { useCategoryOperations } from './useCategoryOperations';

interface FileOperationsProps {
  creatorId?: string;
  onFilesChanged: () => void;
  setAvailableFolders?: React.Dispatch<React.SetStateAction<Folder[]>>;
  setAvailableCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  setCurrentFolder?: (folderId: string) => void;
  setCurrentCategory?: (categoryId: string | null) => void;
}

export const useFileOperations = (props: FileOperationsProps) => {
  // Using individual hooks for each domain of operations
  const createOps = useCreateOperations(props);
  const folderOps = useFolderOperations(props);
  const categoryOps = useCategoryOperations(props);

  // Combine the processing state from all hooks
  const isProcessing = createOps.isProcessing || folderOps.isProcessing || categoryOps.isProcessing;

  // Combine and return all operations
  return {
    // Create operations
    handleCreateFolder: createOps.handleCreateFolder,
    handleCreateCategory: createOps.handleCreateCategory,
    
    // Folder operations
    handleAddFilesToFolder: folderOps.handleAddFilesToFolder,
    handleRemoveFromFolder: folderOps.handleRemoveFromFolder,
    handleDeleteFolder: folderOps.handleDeleteFolder,
    handleRenameFolder: folderOps.handleRenameFolder,
    
    // Category operations
    handleDeleteCategory: categoryOps.handleDeleteCategory,
    handleRenameCategory: categoryOps.handleRenameCategory,
    
    // Common state
    isProcessing
  };
};
