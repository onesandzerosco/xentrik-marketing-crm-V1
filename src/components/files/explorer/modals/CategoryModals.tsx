
import React, { useEffect } from 'react';
import { CreateFolderModal } from '../CreateFolderModal';
import { RenameModal } from '../RenameModal';
import { DeleteModal } from '../DeleteModal';
import { Category } from '@/types/fileTypes';

interface CategoryModalsProps {
  // Category folder creation modal
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  
  // Category folder rename modal
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  folderCurrentName: string;
  
  // Category folder deletion modal
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  
  // Data
  categories: Category[];
  
  // Handlers
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: () => void;
  handleRenameFolder: () => void;
  
  // Optional callbacks
  onCreateNewFolder?: () => void;
}

export const CategoryModals: React.FC<CategoryModalsProps> = ({
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  folderCurrentName,
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  categories,
  handleCreateFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  onCreateNewFolder
}) => {
  const [newFolderNameForRename, setNewFolderNameForRename] = React.useState<string>('');
  
  useEffect(() => {
    if (isRenameFolderModalOpen) {
      setNewFolderNameForRename(folderCurrentName);
    }
  }, [isRenameFolderModalOpen, folderCurrentName]);

  return (
    <>
      {/* Create Folder Modal */}
      <CreateFolderModal 
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryId={selectedCategoryForNewFolder}
        availableCategories={categories}
        handleSubmit={handleCreateFolderSubmit}
        onCreate={onCreateNewFolder}
      />
      
      {/* Delete Folder Modal */}
      <DeleteModal 
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={setIsDeleteFolderModalOpen}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Files will be moved to Unsorted Uploads."
        onConfirm={handleDeleteFolder}
      />
      
      {/* Rename Folder Modal */}
      <RenameModal 
        isOpen={isRenameFolderModalOpen}
        onOpenChange={setIsRenameFolderModalOpen}
        title="Rename Folder"
        currentName={newFolderNameForRename}
        setNewName={setNewFolderNameForRename}
        onConfirm={handleRenameFolder}
      />
    </>
  );
};
