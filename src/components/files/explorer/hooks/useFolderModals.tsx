
import { useState } from 'react';

export const useFolderModals = () => {
  // Category modals
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isRenameCategoryModalOpen, setIsRenameCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
  const [categoryCurrentName, setCategoryCurrentName] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Folder modals
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [folderCurrentName, setFolderCurrentName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [selectedCategoryForNewFolder, setSelectedCategoryForNewFolder] = useState<string>('');
  
  // Handler for deleting a folder
  const handleDeleteFolderClick = (folderId: string) => {
    setFolderToDelete(folderId);
    setIsDeleteFolderModalOpen(true);
  };
  
  // Handler for renaming a folder
  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    setFolderToRename(folderId);
    setFolderCurrentName(currentName);
    setNewFolderName(currentName); // Pre-fill with current name
    setIsRenameFolderModalOpen(true);
  };
  
  // Handler for deleting a category
  const handleDeleteCategoryClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  };
  
  // Handler for renaming a category
  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    setCategoryToRename(categoryId);
    setCategoryCurrentName(currentName);
    setNewCategoryName(currentName); // Pre-fill with current name
    setIsRenameCategoryModalOpen(true);
  };

  return {
    // Category creation modal
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    
    // Category deletion modal
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    handleDeleteCategoryClick,
    
    // Category rename modal
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName,
    setCategoryCurrentName,
    handleRenameCategoryClick,
    
    // Folder creation modal
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    
    // Add to folder modal
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    
    // Delete folder modal
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    setFolderToDelete,
    handleDeleteFolderClick,
    
    // Rename folder modal
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName,
    setFolderCurrentName,
    handleRenameFolderClick
  };
};
