
import React from 'react';
import { FolderModals } from './modals/FolderModals';
import { CategoryModals } from './modals/CategoryModals';
import { NoteModals } from './modals/NoteModals';
import { UploadModals } from './modals/UploadModals';

interface FileExplorerModalsProps {
  // Category modals state
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  isDeleteCategoryModalOpen: boolean;
  setIsDeleteCategoryModalOpen: (open: boolean) => void;
  categoryToDelete: string | null;
  setCategoryToDelete: (id: string | null) => void;
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  categoryToRename: string | null;
  setCategoryToRename: (id: string | null) => void;
  categoryCurrentName: string;
  
  // Folder modals state
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  folderToDelete: string | null;
  setFolderToDelete: (id: string | null) => void;
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void; 
  folderToRename: string | null;
  setFolderToRename: (id: string | null) => void;
  folderCurrentName: string;
  
  // Upload modals state
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  
  // Note modals state
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  editingFile: any;
  editingNote: string;
  setEditingNote: (note: string) => void;
  
  // Data
  selectedFileIds: string[];
  availableCategories: any[];
  availableFolders: any[];
  
  // Handlers for folder operations
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: (folderId: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => void;
  
  // Handlers for category operations
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: (categoryId: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => void;
  handleRenameCategory: (categoryId: string | null, newName: string, setIsRenameCategoryModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => void;
  
  // Handlers for note operations
  handleSaveNote: (note: string) => void;
  onEditNote?: (note: string) => void;

  // Advanced handlers for modal interactions
  handleCreateNewFolder: () => void;
  
  // Creator info
  creatorId?: string;
  creatorName?: string;
  onFilesChanged?: () => void;
  onUploadComplete?: (fileIds: string[]) => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  // Category modals state
  isAddCategoryModalOpen,
  setIsAddCategoryModalOpen,
  newCategoryName,
  setNewCategoryName,
  isDeleteCategoryModalOpen,
  setIsDeleteCategoryModalOpen,
  categoryToDelete,
  setCategoryToDelete,
  isRenameCategoryModalOpen,
  setIsRenameCategoryModalOpen,
  categoryToRename,
  setCategoryToRename,
  categoryCurrentName,
  
  // Folder modals state
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
  folderToDelete,
  setFolderToDelete,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen, // Fixed prop name
  folderToRename,
  setFolderToRename,
  folderCurrentName,
  
  // Upload modals state
  isUploadModalOpen,
  setIsUploadModalOpen,
  
  // Note modals state
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  editingFile,
  editingNote,
  setEditingNote,
  
  // Data
  selectedFileIds,
  availableCategories,
  availableFolders,
  
  // Handlers for folder operations
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  
  // Handlers for category operations
  handleCreateCategorySubmit,
  handleDeleteCategory,
  handleRenameCategory,
  
  // Handlers for note operations
  handleSaveNote,
  
  // Advanced handlers for modal interactions
  handleCreateNewFolder,
  
  // Creator info
  creatorId,
  creatorName,
  onFilesChanged,
  onUploadComplete
}) => {
  // Wrapper functions to ensure correct argument passing
  const handleDeleteCategoryWrapper = () => {
    handleDeleteCategory(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };
  
  const handleRenameCategoryWrapper = () => {
    handleRenameCategory(categoryToRename, newCategoryName, setIsRenameCategoryModalOpen, setCategoryToRename);
  };
  
  return (
    <>
      {/* Folder Modals (Add, Delete, Rename) */}
      <FolderModals 
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
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
        customFolders={availableFolders}
        categories={availableCategories}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        handleDeleteFolder={handleDeleteFolder}
        handleRenameFolder={handleRenameFolder}
        handleCreateNewFolder={handleCreateNewFolder}
      />
      
      {/* Category Modals (Add, Delete, Rename) */}
      <CategoryModals 
        isAddCategoryModalOpen={isAddCategoryModalOpen}
        setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
        setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
        isRenameCategoryModalOpen={isRenameCategoryModalOpen}
        setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
        categoryCurrentName={categoryCurrentName}
        handleCreateCategorySubmit={handleCreateCategorySubmit}
        handleDeleteCategory={handleDeleteCategoryWrapper}
        handleRenameCategory={handleRenameCategoryWrapper}
      />
      
      {/* Note Modals */}
      <NoteModals 
        isEditNoteModalOpen={isEditNoteModalOpen}
        setIsEditNoteModalOpen={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        handleSaveNote={handleSaveNote}
      />
      
      {/* Upload Modals */}
      <UploadModals 
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        creatorId={creatorId}
        creatorName={creatorName}
        onFilesChanged={onFilesChanged}
        onUploadComplete={onUploadComplete}
      />
    </>
  );
};
