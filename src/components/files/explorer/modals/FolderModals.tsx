
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
  
  // Data
  selectedFileIds: string[];
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  
  // Handlers
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: (folderId: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => void;
  
  // Callbacks
  onCreateNewFolder?: () => void;
  
  // Folder IDs to delete and rename
  folderToDelete: string | null;
  setFolderToDelete: (id: string | null) => void;
  folderToRename: string | null;
  setFolderToRename: (id: string | null) => void;
}

export const FolderModals: React.FC<FolderModalsProps> = ({
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
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
  selectedFileIds,
  customFolders,
  categories,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  onCreateNewFolder,
  folderToDelete,
  setFolderToDelete,
  folderToRename,
  setFolderToRename
}) => {
  const [newFolderNameForRename, setNewFolderNameForRename] = React.useState<string>('');
  
  useEffect(() => {
    if (isRenameFolderModalOpen) {
      setNewFolderNameForRename(folderCurrentName);
    }
  }, [isRenameFolderModalOpen, folderCurrentName]);
  
  const onDeleteFolder = () => {
    handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const onRenameFolder = () => {
    handleRenameFolder(folderToRename, newFolderNameForRename, setIsRenameFolderModalOpen, setFolderToRename);
  };

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
        onCreateNewFolder={onCreateNewFolder}
      />
      
      {/* Delete Folder Modal */}
      <DeleteModal 
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={(open) => {
          setIsDeleteFolderModalOpen(open);
          if (!open) setFolderToDelete(null);
        }}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Files will be moved to Unsorted Uploads."
        onConfirm={onDeleteFolder}
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
        onConfirm={onRenameFolder}
      />
    </>
  );
};
