
import React from 'react';
import { CategoryModals } from './modals/CategoryModals';
import { FolderModals } from './modals/FolderModals';
import { NoteModals } from './modals/NoteModals';
import { UploadModals } from './modals/UploadModals';
import { Folder, Category } from '@/types/fileTypes';

interface FileExplorerModalsProps {
  // Category operations
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
  categoryCurrentName: string | null;
  
  // Folder operations
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  setSelectedCategoryForNewFolder: (id: string) => void;
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
  folderCurrentName: string | null;
  
  // Note operations
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  editingFile?: any;
  editingNote: string;
  setEditingNote: (note: string) => void;
  
  // Upload operations
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  
  // Folder and category data
  availableFolders: Folder[];
  availableCategories: Category[];
  selectedFileIds: string[];
  
  // Handlers
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleSaveNote: () => void;
  handleDeleteCategory: () => void;
  handleDeleteFolder: () => void;
  handleRenameCategory: (categoryId: string | null, newName: string, setIsOpen: (open: boolean) => void, setIdToRename: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsOpen: (open: boolean) => void, setIdToRename: (id: string | null) => void) => void;
  
  // Callbacks
  onCreateNewCategory?: () => void;
  onCreateNewFolder?: () => void;
  onUploadComplete?: (fileIds?: string[]) => void;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = (props) => {
  return (
    <>
      {/* Category Modals */}
      <CategoryModals 
        isAddCategoryModalOpen={props.isAddCategoryModalOpen}
        setIsAddCategoryModalOpen={props.setIsAddCategoryModalOpen}
        newCategoryName={props.newCategoryName}
        setNewCategoryName={props.setNewCategoryName}
        isDeleteCategoryModalOpen={props.isDeleteCategoryModalOpen}
        setIsDeleteCategoryModalOpen={props.setIsDeleteCategoryModalOpen}
        categoryToDelete={props.categoryToDelete}
        setCategoryToDelete={props.setCategoryToDelete}
        isRenameCategoryModalOpen={props.isRenameCategoryModalOpen}
        setIsRenameCategoryModalOpen={props.setIsRenameCategoryModalOpen}
        categoryCurrentName={props.categoryCurrentName}
        categories={props.availableCategories}
        handleCreateCategorySubmit={props.handleCreateCategorySubmit}
        handleDeleteCategory={props.handleDeleteCategory}
        handleRenameCategory={props.handleRenameCategory}
        onCreateNewCategory={props.onCreateNewCategory}
      />
      
      {/* Folder Modals */}
      <FolderModals
        isAddFolderModalOpen={props.isAddFolderModalOpen}
        setIsAddFolderModalOpen={props.setIsAddFolderModalOpen}
        newFolderName={props.newFolderName}
        setNewFolderName={props.setNewFolderName}
        selectedCategoryForNewFolder={props.selectedCategoryForNewFolder}
        setSelectedCategoryId={props.setSelectedCategoryForNewFolder}
        isAddToFolderModalOpen={props.isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={props.setIsAddToFolderModalOpen}
        targetFolderId={props.targetFolderId}
        setTargetFolderId={props.setTargetFolderId}
        targetCategoryId={props.targetCategoryId}
        setTargetCategoryId={props.setTargetCategoryId}
        isDeleteFolderModalOpen={props.isDeleteFolderModalOpen}
        setIsDeleteFolderModalOpen={props.setIsDeleteFolderModalOpen}
        isRenameFolderModalOpen={props.isRenameFolderModalOpen}
        setIsRenameFolderModalOpen={props.setIsRenameFolderModalOpen}
        folderCurrentName={props.folderCurrentName || ''}
        selectedFileIds={props.selectedFileIds}
        customFolders={props.availableFolders.filter(f => f.id !== 'all' && f.id !== 'unsorted')}
        categories={props.availableCategories}
        handleCreateFolderSubmit={props.handleCreateFolderSubmit}
        handleAddToFolderSubmit={props.handleAddToFolderSubmit}
        handleDeleteFolder={props.handleDeleteFolder}
        handleRenameFolder={() => 
          props.handleRenameFolder(
            props.folderToRename, 
            props.folderCurrentName || '', 
            props.setIsRenameFolderModalOpen, 
            props.setFolderToRename
          )
        }
        onCreateNewCategory={props.onCreateNewCategory}
        onCreateNewFolder={props.onCreateNewFolder}
      />
      
      {/* Note Modals */}
      <NoteModals
        isEditNoteModalOpen={props.isEditNoteModalOpen}
        setIsEditNoteModalOpen={props.setIsEditNoteModalOpen}
        editingFile={props.editingFile}
        editingNote={props.editingNote}
        setEditingNote={props.setEditingNote}
        handleSaveNote={props.handleSaveNote}
      />
      
      {/* Upload Modals */}
      <UploadModals 
        isUploadModalOpen={props.isUploadModalOpen}
        setIsUploadModalOpen={props.setIsUploadModalOpen}
        availableFolders={props.availableFolders}
        availableCategories={props.availableCategories}
        onUploadComplete={props.onUploadComplete}
      />
    </>
  );
};
