
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

export const useFolderModals = () => {
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [targetFolderId, setTargetFolderId] = useState<string>('');

  // Handler for deleting a folder - Modified to return a Promise
  const handleDeleteFolderClick = async (folderId: string): Promise<void> => {
    setFolderToDelete(folderId);
    setIsDeleteFolderModalOpen(true);
    return Promise.resolve(); // Return a resolved promise
  };

  return {
    // Folder creation modal
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
    handleDeleteFolderClick
  };
};
