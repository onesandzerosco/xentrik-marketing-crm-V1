
import React from 'react';
import { 
  UploadModals, 
  CategoryModals, 
  FolderModals, 
  NoteModals 
} from './index';
import { Category, CreatorFileType } from '@/types/fileTypes';

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
  categoryToDelete: string | null;
  setCategoryToDelete: (id: string | null) => void;
  categoryToRename: string | null;
  setCategoryToRename: (id: string | null) => void;
  
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
  folderToDelete: string | null;
  setFolderToDelete: (id: string | null) => void;
  folderToRename: string | null;
  setFolderToRename: (id: string | null) => void;
  
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
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  editingFile?: CreatorFileType;
  editingNote: string;
  setEditingNote: (note: string) => void;
  
  // Callbacks
  onUploadComplete?: (fileIds?: string[]) => void;
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: (categoryId: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => void;
  handleDeleteFolder: (folderId: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => void;
  handleRenameCategory: (categoryId: string | null, newName: string, setIsRenameCategoryModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => void;
  handleSaveNote: (note: string) => void;
  onCreateNewCategory?: () => void;
  onCreateNewFolder?: () => void;
}

export const FileExplorerModalsContainer: React.FC<FileExplorerModalsProps> = ({
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
  categoryToDelete,
  setCategoryToDelete,
  categoryToRename,
  setCategoryToRename,
  
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
  folderToDelete,
  setFolderToDelete,
  folderToRename,
  setFolderToRename,
  
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
  onCreateNewFolder,
}) => {
  return (
    <>
      {/* File Upload Modal */}
      <UploadModals
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
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
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
        setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
        isRenameCategoryModalOpen={isRenameCategoryModalOpen}
        setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
        categoryCurrentName={categoryCurrentName}
        categoryToDelete={categoryToDelete}
        setCategoryToDelete={setCategoryToDelete}
        categoryToRename={categoryToRename}
        setCategoryToRename={setCategoryToRename}
        handleCreateCategorySubmit={handleCreateCategorySubmit}
        handleDeleteCategory={handleDeleteCategory}
        handleRenameCategory={handleRenameCategory}
        onCreateNewCategory={onCreateNewCategory}
      />
      
      {/* Folder Modals */}
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
        folderToDelete={folderToDelete}
        setFolderToDelete={setFolderToDelete}
        folderToRename={folderToRename}
        setFolderToRename={setFolderToRename}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        categories={categories}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        handleDeleteFolder={handleDeleteFolder}
        handleRenameFolder={handleRenameFolder}
        onCreateNewFolder={onCreateNewFolder}
      />
      
      {/* Note Modals */}
      <NoteModals
        isEditNoteModalOpen={isEditNoteModalOpen}
        setIsEditNoteModalOpen={setIsEditNoteModalOpen}
        editingFile={editingFile || null}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        handleSaveNote={handleSaveNote}
      />
    </>
  );
};
