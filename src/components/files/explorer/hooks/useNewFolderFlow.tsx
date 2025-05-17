
import { useState, useEffect } from 'react';
import { Category } from '@/types/fileTypes';

interface UseNewFolderFlowProps {
  onRefresh: () => void;
  availableCategories: Category[];
}

export const useNewFolderFlow = ({ 
  onRefresh, 
  availableCategories 
}: UseNewFolderFlowProps) => {
  // Modal state for the new folder flow
  const [showNewFolderInCategory, setShowNewFolderInCategory] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');

  // Handler for creating a new category from the AddToFolder modal
  const handleCreateNewCategory = (
    setIsAddToFolderModalOpen: (open: boolean) => void, 
    setIsAddCategoryModalOpen: (open: boolean) => void
  ) => {
    setIsAddToFolderModalOpen(false);
    setTimeout(() => {
      setIsAddCategoryModalOpen(true);
      setShowNewFolderInCategory(true); // Flag to show folder creation after category
    }, 100);
  };
  
  // Handler for creating a new folder from the AddToFolder modal
  const handleCreateNewFolder = (
    setIsAddToFolderModalOpen: (open: boolean) => void,
    setIsAddFolderModalOpen: (open: boolean) => void,
    setSelectedCategoryForNewFolder: (categoryId: string) => void
  ) => {
    if (targetCategoryId) {
      setIsAddToFolderModalOpen(false);
      setTimeout(() => {
        setSelectedCategoryForNewFolder(targetCategoryId);
        setIsAddFolderModalOpen(true);
      }, 100);
    }
  };

  // Handler for after category creation in the flow
  const handleCategoryCreatedInFlow = (
    categoryName: string,
    setIsAddFolderModalOpen: (open: boolean) => void,
    setSelectedCategoryForNewFolder: (categoryId: string) => void
  ) => {
    if (showNewFolderInCategory) {
      onRefresh(); // Refresh to get the new category
      
      // Wait for state update before opening folder modal
      setTimeout(() => {
        const newCategoryId = availableCategories.find(c => c.name === categoryName)?.id;
        if (newCategoryId) {
          setSelectedCategoryForNewFolder(newCategoryId);
          setIsAddFolderModalOpen(true);
          setShowNewFolderInCategory(false); // Reset the flag
        }
      }, 500);
      return true;
    }
    return false;
  };

  return {
    showNewFolderInCategory,
    setShowNewFolderInCategory,
    targetCategoryId,
    setTargetCategoryId,
    handleCreateNewCategory,
    handleCreateNewFolder,
    handleCategoryCreatedInFlow
  };
};
