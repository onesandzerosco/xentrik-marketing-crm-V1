
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileUploadModal } from './FileUploadModal';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { AddToFolderModal } from './AddToFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { EditNoteModal } from './EditNoteModal';
import { RenameFolderModal } from './RenameFolderModal';
import { RenameCategoryModal } from './RenameCategoryModal';

interface Folder {
  id: string;
  name: string;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface FileExplorerModalsProps {
  // Upload modal
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  
  // Category modals
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  isDeleteCategoryModalOpen: boolean;
  setIsDeleteCategoryModalOpen: (open: boolean) => void;
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  categoryCurrentName: string;
  
  // Folder modals
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  
  // Common props
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  folderCurrentName: string;
  selectedFileIds: string[];
  
  // Selection state
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  selectedCategoryForNewFolder: string;
  
  // Data
  customFolders: Folder[];
  categories: Category[];
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  
  // Callbacks
  onUploadComplete?: (fileIds?: string[]) => void;
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: () => void;
  handleDeleteFolder: () => void;
  handleRenameCategory: (e: React.FormEvent) => void;
  handleRenameFolder: (e: React.FormEvent) => void;
  handleSaveNote: () => void;
  onCreateNewCategory: () => void;
  onCreateNewFolder: () => void;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  // Upload modal
  isUploadModalOpen,
  setIsUploadModalOpen,
  
  // Category modals
  isAddCategoryModalOpen,
  setIsAddCategoryModalOpen,
  isDeleteCategoryModalOpen,
  setIsDeleteCategoryModalOpen,
  isRenameCategoryModalOpen,
  setIsRenameCategoryModalOpen,
  newCategoryName,
  setNewCategoryName,
  categoryCurrentName,
  
  // Folder modals
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  
  // Common props
  creatorId,
  creatorName,
  currentFolder,
  newFolderName,
  setNewFolderName,
  folderCurrentName,
  selectedFileIds,
  
  // Selection state
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  selectedCategoryForNewFolder,
  
  // Data
  customFolders,
  categories,
  editingFile,
  editingNote,
  setEditingNote,
  
  // Callbacks
  onUploadComplete,
  handleCreateCategorySubmit,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteCategory,
  handleDeleteFolder,
  handleRenameCategory,
  handleRenameFolder,
  handleSaveNote,
  onCreateNewCategory,
  onCreateNewFolder
}) => {
  return (
    <>
      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        creatorId={creatorId}
        creatorName={creatorName}
        onUploadComplete={(fileIds) => {
          onUploadComplete?.(fileIds);
        }}
        currentFolder={currentFolder}
      />
      
      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onSubmit={handleCreateCategorySubmit}
      />
      
      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFileIds={selectedFileIds}
        categoryId={selectedCategoryForNewFolder}
        onSubmit={handleCreateFolderSubmit}
      />
      
      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        categories={categories}
        selectedCategoryId={targetCategoryId}
        setSelectedCategoryId={setTargetCategoryId}
        onSubmit={handleAddToFolderSubmit}
        onCreateNewCategory={onCreateNewCategory}
        onCreateNewFolder={onCreateNewFolder}
      />
      
      {/* Delete Category Confirmation Modal */}
      <DeleteCategoryModal
        isOpen={isDeleteCategoryModalOpen}
        onOpenChange={setIsDeleteCategoryModalOpen}
        onConfirm={handleDeleteCategory}
      />
      
      {/* Delete Folder Confirmation Modal */}
      <DeleteFolderModal
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={setIsDeleteFolderModalOpen}
        onConfirm={handleDeleteFolder}
      />
      
      {/* Rename Category Modal */}
      <RenameCategoryModal
        isOpen={isRenameCategoryModalOpen}
        onOpenChange={setIsRenameCategoryModalOpen}
        categoryCurrentName={categoryCurrentName}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onSubmit={handleRenameCategory}
      />
      
      {/* Rename Folder Modal */}
      <RenameFolderModal
        isOpen={isRenameFolderModalOpen}
        onOpenChange={setIsRenameFolderModalOpen}
        folderCurrentName={folderCurrentName}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onSubmit={handleRenameFolder}
      />
      
      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={isEditNoteModalOpen}
        onOpenChange={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onSave={handleSaveNote}
      />
    </>
  );
};
