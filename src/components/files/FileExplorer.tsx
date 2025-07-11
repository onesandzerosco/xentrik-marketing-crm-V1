import React, { useState, useEffect } from 'react';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { CategorySidebar } from './explorer/CategorySidebar';
import { CategoryModals } from './explorer/modals/CategoryModals';
import { FolderModals } from './explorer/modals/FolderModals';
import { DeleteCategoryModal } from './explorer/DeleteCategoryModal';
import { DeleteFolderModal } from './explorer/DeleteFolderModal';
import { useFolderModals } from './explorer/hooks/useFolderModals';
import { useFolderOperations } from './explorer/hooks/useFolderOperations';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds,
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  const {
    // Category creation modal
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    
    // Category deletion modal
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    handleDeleteCategoryClick,
    
    // Category rename modal
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName,
    setCategoryCurrentName,
    handleRenameCategoryClick,
    
    // Folder creation modal
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    
    // Add to folder modal
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    
    // Delete folder modal
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    setFolderToDelete,
    handleDeleteFolderClick,
    
    // Rename folder modal
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName,
    setFolderCurrentName,
    handleRenameFolderClick
  } = useFolderModals();

  // Add state for delete confirmations
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = React.useState(false);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = React.useState(false);
  const [categoryToDeleteConfirm, setCategoryToDeleteConfirm] = React.useState<string | null>(null);
  const [folderToDeleteConfirm, setFolderToDeleteConfirm] = React.useState<string | null>(null);

  const {
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory
  } = useFolderOperations({
    onCreateFolder,
    onCreateCategory,
    onAddFilesToFolder,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory,
    onRefresh
  });

  // Add confirmation handlers for deletion
  const handleConfirmDeleteCategory = (categoryId: string) => {
    setCategoryToDeleteConfirm(categoryId);
    setShowDeleteCategoryConfirm(true);
  };

  const handleConfirmDeleteFolder = (folderId: string) => {
    setFolderToDeleteConfirm(folderId);
    setShowDeleteFolderConfirm(true);
  };

  const handleDeleteCategoryConfirmed = async () => {
    if (categoryToDeleteConfirm) {
      await onDeleteCategory(categoryToDeleteConfirm);
      setCategoryToDeleteConfirm(null);
      setShowDeleteCategoryConfirm(false);
    }
  };

  const handleDeleteFolderConfirmed = async () => {
    if (folderToDeleteConfirm) {
      await onDeleteFolder(folderToDeleteConfirm);
      setFolderToDeleteConfirm(null);
      setShowDeleteFolderConfirm(false);
    }
  };

  // Get custom folders (excluding system folders)
  const customFolders = availableFolders.filter(folder => 
    folder.id !== 'all' && folder.id !== 'unsorted'
  );

  // Handle creating a new folder from the "Add to Folder" modal
  const handleCreateNewFolder = () => {
    setIsAddToFolderModalOpen(false);
    setSelectedCategoryForNewFolder(targetCategoryId);
    setIsAddFolderModalOpen(true);
  };

  // Handle creating a new category from the "Add to Folder" modal
  const handleCreateNewCategory = () => {
    setIsAddToFolderModalOpen(false);
    setIsAddCategoryModalOpen(true);
  };

  // Enhanced form submission handlers that include the necessary context
  const handleCreateCategorySubmitWithContext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add the context to the event target
    Object.assign(e.currentTarget, {
      newCategoryName,
      setIsAddCategoryModalOpen,
      setNewCategoryName
    });
    
    handleCreateCategorySubmit(e);
  };

  const handleCreateFolderSubmitWithContext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add the context to the event target
    Object.assign(e.currentTarget, {
      newFolderName,
      selectedFileIds,
      categoryId: selectedCategoryForNewFolder,
      setIsAddFolderModalOpen,
      setNewFolderName,
      setSelectedFileIds
    });
    
    handleCreateFolderSubmit(e);
  };

  const handleAddToFolderSubmitWithContext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add the context to the event target
    Object.assign(e.currentTarget, {
      targetFolderId,
      targetCategoryId,
      selectedFileIds,
      setIsAddToFolderModalOpen,
      setTargetFolderId,
      setSelectedFileIds
    });
    
    handleAddToFolderSubmit(e);
  };

  const handleDeleteFolderWithContext = (folderToDelete: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => {
    return handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };

  const handleDeleteCategoryWithContext = (categoryToDelete: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => {
    return handleDeleteCategory(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };

  const handleRenameFolderWithContext = (folderToRename: string | null, newFolderName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => {
    return handleRenameFolder(folderToRename, newFolderName, setIsRenameFolderModalOpen, setFolderToRename);
  };

  const handleRenameCategoryWithContext = (categoryToRename: string | null, newCategoryName: string, setIsRenameCategoryModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => {
    return handleRenameCategory(categoryToRename, newCategoryName, setIsRenameCategoryModalOpen, setCategoryToRename);
  };

  return (
    <div className="h-full flex">
      <div className="w-64 bg-sidebar border-r p-4 overflow-y-auto">
        <CategorySidebar 
          categories={availableCategories}
          folders={availableFolders}
          currentCategory={currentCategory}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          onFolderChange={onFolderChange}
          onInitiateNewCategory={() => setIsAddCategoryModalOpen(true)}
          onInitiateNewFolder={(categoryId) => {
            setSelectedCategoryForNewFolder(categoryId);
            setIsAddFolderModalOpen(true);
          }}
          onDeleteCategory={onDeleteCategory}
          onRenameCategory={handleRenameCategoryClick}
          onDeleteFolder={onDeleteFolder}
          onRenameFolder={handleRenameFolderClick}
          onConfirmDeleteCategory={handleConfirmDeleteCategory}
          onConfirmDeleteFolder={handleConfirmDeleteFolder}
        />
      </div>
      
      <div className="flex-1">
        <FileExplorerContent 
          files={files}
          creatorName={creatorName}
          creatorId={creatorId}
          isLoading={isLoading}
          onRefresh={onRefresh}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          isCreatorView={isCreatorView}
          onUploadComplete={onUploadComplete}
          onUploadStart={onUploadStart}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolder={() => setIsAddToFolderModalOpen(true)}
          onRemoveFromFolder={onRemoveFromFolder}
        />
      </div>

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
        setCategoryCurrentName={setCategoryCurrentName}
        categoryToRename={categoryToRename}
        categories={availableCategories}
        handleCreateCategorySubmit={handleCreateCategorySubmitWithContext}
        handleDeleteCategory={() => handleDeleteCategoryWithContext(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete)}
        handleRenameCategory={handleRenameCategoryWithContext}
      />

      {/* Folder Modals */}
      <FolderModals 
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
        setSelectedCategoryForNewFolder={setSelectedCategoryForNewFolder}
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
        categories={availableCategories}
        handleCreateFolderSubmit={handleCreateFolderSubmitWithContext}
        handleAddToFolderSubmit={handleAddToFolderSubmitWithContext}
        handleDeleteFolder={handleDeleteFolderWithContext}
        handleRenameFolder={handleRenameFolderWithContext}
        handleCreateNewFolder={handleCreateNewFolder}
        handleCreateNewCategory={handleCreateNewCategory}
      />

      {/* Delete Category Confirmation Modal */}
      <DeleteCategoryModal 
        isOpen={showDeleteCategoryConfirm}
        onOpenChange={setShowDeleteCategoryConfirm}
        onConfirm={handleDeleteCategoryConfirmed}
      />

      {/* Delete Folder Confirmation Modal */}
      <DeleteFolderModal 
        isOpen={showDeleteFolderConfirm}
        onOpenChange={setShowDeleteFolderConfirm}
        onConfirm={handleDeleteFolderConfirmed}
      />
    </div>
  );
};
