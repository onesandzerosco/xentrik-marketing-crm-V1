
import React, { useEffect } from 'react';
import { CreateFolderModal } from '../CreateFolderModal';
import { AddToFolderModal } from '../AddToFolderModal';
import { DeleteModal } from '../DeleteModal';
import { RenameModal } from '../RenameModal';
import { Category } from '@/types/fileTypes';

interface FolderModalsProps {
  // Folder creation modal
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  setSelectedCategoryId: (id: string) => void;
  
  // Add to folder modal
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  
  // Folder deletion modal
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  
  // Folder rename modal
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  folderCurrentName: string;
  folderToRename: string | null; // Added missing prop
  setFolderToRename: (id: string | null) => void; // Added missing prop
  
  // Data
  selectedFileIds: string[];
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  
  // Handlers
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: () => void;
  handleRenameFolder: () => void;
  
  // Callbacks
  onCreateNewCategory?: () => void;
  onCreateNewFolder?: () => void;
}

export const FolderModals: React.FC<FolderModalsProps> = ({
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  setSelectedCategoryId,
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  folderCurrentName,
  folderToRename, // Added missing prop
  setFolderToRename, // Added missing prop
  selectedFileIds,
  customFolders,
  categories,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  onCreateNewCategory,
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
        setSelectedCategoryId={setSelectedCategoryId}
        availableCategories={categories}
        handleSubmit={handleCreateFolderSubmit}
        onCreateNewCategory={onCreateNewCategory}
      />
      
      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        numSelectedFiles={selectedFileIds.length}
        customFolders={customFolders}
        categories={categories}
        handleSubmit={handleAddToFolderSubmit}
        onCreateNewCategory={onCreateNewCategory}
      />
      
      {/* Delete Folder Modal */}
      <DeleteModal 
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={(open) => {
          setIsDeleteFolderModalOpen(open);
          if (!open) setFolderToRename(null);
        }}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Files will be moved to Unsorted Uploads."
        onConfirm={handleDeleteFolder}
      />
      
      {/* Rename Folder Modal */}
      <RenameModal
        isOpen={isRenameFolderModalOpen}
        onOpenChange={(open) => {
          setIsRenameFolderModalOpen(open);
          if (!open) setFolderToRename(null);
        }}
        title="Rename Folder"
        currentName={newFolderNameForRename}
        setNewName={setNewFolderNameForRename}
        onConfirm={handleRenameFolder}
      />
    </>
  );
};
