
import React from 'react';
import { FileUploadModal } from './FileUploadModal';
import { EditNoteModal } from './EditNoteModal';
import { FolderModals } from './modals/FolderModals';
import { CategoryModals } from './modals/CategoryModals';
import { Category, CreatorFileType } from '@/types/fileTypes';

// Import any missing interfaces and types
interface FileExplorerModalsProps {
  // Common props
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  selectedFileIds: string[];

  // Upload modal
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  onUploadComplete?: (fileIds?: string[]) => void;
  
  // Category modals
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  isDeleteCategoryModalOpen: boolean;
  setIsDeleteCategoryModalOpen: (open: boolean) => void;
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName?: (name: string) => void;
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
  newFolderName: string;
  setNewFolderName?: (name: string) => void;
  folderCurrentName: string;
  
  // File note modal
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  editingFile?: CreatorFileType;
  editingNote: string;
  setEditingNote: (note: string) => void;
  
  // Selection state
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  selectedCategoryForNewFolder: string;
  
  // Data
  customFolders: {id: string; name: string; categoryId: string}[];
  categories: Category[];
  
  // Handlers
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: () => void;
  handleDeleteCategory: () => void;
  handleRenameFolder: () => void;
  handleRenameCategory: () => void;
  handleSaveNote: () => void;
  onCreateNewCategory?: () => void;
  onCreateNewFolder?: () => void;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  // Common props
  creatorId,
  creatorName,
  currentFolder,
  selectedFileIds,
  
  // Upload modal
  isUploadModalOpen,
  setIsUploadModalOpen,
  onUploadComplete,
  
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
  newFolderName,
  setNewFolderName,
  folderCurrentName,
  
  // File note modal
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  editingFile,
  editingNote,
  setEditingNote,
  
  // Selection state
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  selectedCategoryForNewFolder,
  
  // Data
  customFolders,
  categories,
  
  // Handlers
  handleCreateCategorySubmit,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleDeleteCategory,
  handleRenameFolder,
  handleRenameCategory,
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
        currentFolder={currentFolder}
        availableCategories={categories}
        onUploadComplete={onUploadComplete}
      />
      
      {/* Category Modals */}
      <CategoryModals 
        isAddCategoryModalOpen={isAddCategoryModalOpen}
        setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
        setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
        isRenameCategoryModalOpen={isRenameCategoryModalOpen}
        setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        categoryCurrentName={categoryCurrentName}
        handleCreateCategorySubmit={handleCreateCategorySubmit}
        handleDeleteCategory={handleDeleteCategory}
        handleRenameCategory={handleRenameCategory}
      />
      
      {/* Folder Modals */}
      <FolderModals 
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
        setSelectedCategoryId={(categoryId) => {/* This will be implemented in the FolderModals component */}}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        isDeleteFolderModalOpen={isDeleteFolderModalOpen}
        setIsDeleteFolderModalOpen={setIsDeleteFolderModalOpen}
        isRenameFolderModalOpen={isRenameFolderModalOpen}
        setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
        folderCurrentName={folderCurrentName}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        categories={categories}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        handleDeleteFolder={handleDeleteFolder}
        handleRenameFolder={handleRenameFolder}
        onCreateNewCategory={onCreateNewCategory}
      />
      
      {/* File Note Modal */}
      <EditNoteModal 
        isOpen={isEditNoteModalOpen}
        onOpenChange={setIsEditNoteModalOpen}
        file={editingFile}
        note={editingNote}
        setNote={setEditingNote}
        onSave={handleSaveNote}
      />
    </>
  );
};
