
import { useState } from 'react';
import { Folder } from '@/types/fileTypes';

export const useFolderModals = () => {
  // Standard folder modals
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);

  // Folder modal state
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [folderCurrentName, setFolderCurrentName] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>('');

  // Nested folder state
  const [isCategory, setIsCategory] = useState(false);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);

  // Handler for deleting a folder
  const handleDeleteFolderClick = async (folderId: string): Promise<void> => {
    setFolderToDelete(folderId);
    setIsDeleteFolderModalOpen(true);
    return Promise.resolve(); // Return a resolved promise
  };
  
  // Handler for renaming a folder
  const handleRenameFolderClick = async (folderId: string, currentName: string): Promise<void> => {
    setFolderToRename(folderId);
    setFolderCurrentName(currentName);
    setNewFolderName(currentName); // Pre-fill with current name
    setIsRenameFolderModalOpen(true);
    return Promise.resolve();
  };

  // Handler for creating a category
  const handleCreateCategoryClick = () => {
    setIsCategory(true);
    setParentFolderId(null);
    setNewFolderName('');
    setIsCategoryModalOpen(true);
  };

  // Handler for creating a subfolder
  const handleCreateSubfolderClick = (parentId: string) => {
    setIsCategory(false);
    setParentFolderId(parentId);
    setNewFolderName('');
    setIsSubfolderModalOpen(true);
  };

  return {
    // Standard folder modals
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    
    // Add to folder modal
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    
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
    handleRenameFolderClick,
    
    // Nested folder state
    isCategory,
    setIsCategory,
    parentFolderId,
    setParentFolderId,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isSubfolderModalOpen,
    setIsSubfolderModalOpen,
    handleCreateCategoryClick,
    handleCreateSubfolderClick
  };
};
