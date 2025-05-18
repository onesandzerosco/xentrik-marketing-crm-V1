
import React, { useState } from 'react';
import { CreateFolderModal } from './CreateFolderModal';
import { AddToFolderModal } from './AddToFolderModal';
import { DeleteModal } from './DeleteModal';
import { RenameModal } from './RenameModal';
import { Category } from '@/types/fileTypes';
import { AddTagModal } from './modals/TagModals';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerModalsProps {
  // Selected files
  selectedFileIds: string[];
  
  // Available data
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  availableTags?: FileTag[];
  
  // Add to folder modal
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  
  // Tags modal
  isAddTagModalOpen?: boolean;
  setIsAddTagModalOpen?: (open: boolean) => void;
  onTagSelect?: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;

  // Create folder modal
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  setSelectedCategoryForNewFolder: (id: string) => void;
  
  // Folder handlers
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId: string) => Promise<void>;
  handleCreateNewFolder: () => void;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  // Selected files
  selectedFileIds,
  
  // Available data
  customFolders,
  categories,
  availableTags = [],

  // Add to folder modal
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  
  // Tags modal
  isAddTagModalOpen = false,
  setIsAddTagModalOpen = () => {},
  onTagSelect = () => {},
  onTagCreate,

  // Create folder modal
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  setSelectedCategoryForNewFolder,
  
  // Folder handlers
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleCreateNewFolder
}) => {
  return (
    <>
      {/* Create Folder Modal */}
      <CreateFolderModal 
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryId={selectedCategoryForNewFolder}
        setSelectedCategoryId={setSelectedCategoryForNewFolder}
        availableCategories={categories}
        handleSubmit={handleCreateFolderSubmit}
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
        onCreateNewFolder={handleCreateNewFolder}
      />

      {/* Add Tag Modal */}
      {setIsAddTagModalOpen && (
        <AddTagModal
          isOpen={isAddTagModalOpen}
          onOpenChange={setIsAddTagModalOpen}
          selectedFileIds={selectedFileIds}
          availableTags={availableTags}
          onTagSelect={onTagSelect}
          onTagCreate={onTagCreate}
        />
      )}
    </>
  );
};
