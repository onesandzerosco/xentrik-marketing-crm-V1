import React from 'react';
import { FileUploadModal } from './FileUploadModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { CreateFolderModal } from './CreateFolderModal';
import { AddToFolderModal } from './AddToFolderModal';
import { DeleteModal } from './DeleteModal';
import { EditNoteModal } from './EditNoteModal';
import { RenameModal } from './RenameModal';
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

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
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
  onCreateNewFolder,
}) => {
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = React.useState<string | null>(null);
  const [categoryToRename, setCategoryToRename] = React.useState<string | null>(null);
  const [folderToRename, setFolderToRename] = React.useState<string | null>(null);
  const [newCategoryNameForRename, setNewCategoryNameForRename] = React.useState<string>('');
  const [newFolderNameForRename, setNewFolderNameForRename] = React.useState<string>('');
  
  React.useEffect(() => {
    if (isRenameCategoryModalOpen) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);

  React.useEffect(() => {
    if (isRenameFolderModalOpen) {
      setNewFolderNameForRename(folderCurrentName);
    }
  }, [isRenameFolderModalOpen, folderCurrentName]);
  
  const onDeleteCategory = () => {
    handleDeleteCategory(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };
  
  const onDeleteFolder = () => {
    handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const onRenameCategory = () => {
    handleRenameCategory(categoryToRename, newCategoryNameForRename, setIsRenameCategoryModalOpen, setCategoryToRename);
  };
  
  const onRenameFolder = () => {
    handleRenameFolder(folderToRename, newFolderNameForRename, setIsRenameFolderModalOpen, setFolderToRename);
  };

  return (
    <>
      {/* File Upload Modal */}
      <FileUploadModal 
        isOpen={isUploadModalOpen} 
        onOpenChange={setIsUploadModalOpen} 
        creatorId={creatorId}
        creatorName={creatorName}
        onUploadComplete={onUploadComplete}
        currentFolder={currentFolder}
        availableCategories={categories}
      />
      
      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        categoryName={newCategoryName}
        setCategoryName={setNewCategoryName}
        handleSubmit={handleCreateCategorySubmit}
        onCreate={onCreateNewCategory}
      />
      
      {/* Create Folder Modal */}
      <CreateFolderModal 
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
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
      />
      
      {/* Delete Category Modal */}
      <DeleteModal 
        isOpen={isDeleteCategoryModalOpen}
        onOpenChange={(open) => {
          setIsDeleteCategoryModalOpen(open);
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category? All folders within the category will also be deleted. Files will be moved to Unsorted Uploads."
        onConfirm={onDeleteCategory}
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
      
      {/* Rename Category Modal */}
      <RenameModal
        isOpen={isRenameCategoryModalOpen}
        onOpenChange={(open) => {
          setIsRenameCategoryModalOpen(open);
          if (!open) setCategoryToRename(null);
        }}
        title="Rename Category"
        currentName={newCategoryNameForRename}
        setNewName={setNewCategoryNameForRename}
        onConfirm={onRenameCategory}
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
      
      {/* Edit Note Modal */}
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
