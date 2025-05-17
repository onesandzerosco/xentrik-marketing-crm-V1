
import React from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { FileExplorerModalsContainer } from './explorer/modals/FileExplorerModalsContainer';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';

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
  isCreatorView?: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
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
  isCreatorView = false,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    handleDeleteCategoryClick,
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName, 
    setCategoryCurrentName,
    handleRenameCategoryClick,
    
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
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
    handleDeleteFolderClick,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName, 
    setFolderCurrentName,
    handleRenameFolderClick,
    
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles,
    
    isUploadModalOpen,
    setIsUploadModalOpen,
    
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    
    handleAddToFolderClick,
    handleCreateNewCategory,
    handleCreateNewFolder,
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory,
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder,
    onCreateCategory,
    onAddFilesToFolder,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory
  });
  
  // Custom folders (excluding 'all' and 'unsorted')
  const customFolders = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );
  
  // Handle file upload button click
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    setIsUploadModalOpen(true);
  };

  // Create wrapper function for handleCreateNewCategory that doesn't need parameters
  const handleCreateNewCategoryWrapper = () => {
    handleCreateNewCategory();
  };
  
  // Create wrapper function for handleInitiateNewFolder that doesn't need parameters
  const handleInitiateNewFolderWrapper = () => {
    handleInitiateNewFolder(currentCategory || '');
  };

  // Context value with properly matching function signatures
  const contextValue = {
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    handleAddToFolderClick,
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    creatorName,
    creatorId,
    isCreatorView,
    availableFolders,
    availableCategories,
    onRemoveFromFolder,
    handleDeleteCategory: async (categoryId: string, setModalOpen: (open: boolean) => void, setIdToDelete: (id: string | null) => void) => {
      if (handleDeleteCategory) {
        return handleDeleteCategory(categoryId, setModalOpen, setIdToDelete);
      }
      return Promise.resolve();
    },
    handleRenameCategory: async (categoryId: string, newName: string, setModalOpen: (open: boolean) => void, setIdToRename: (id: string | null) => void) => {
      if (handleRenameCategory) {
        return handleRenameCategory(categoryId, newName, setModalOpen, setIdToRename);
      }
      return Promise.resolve();
    },
    handleDeleteFolder: async (folderId: string, setModalOpen: (open: boolean) => void, setIdToDelete: (id: string | null) => void) => {
      if (handleDeleteFolder) {
        return handleDeleteFolder(folderId, setModalOpen, setIdToDelete);
      }
      return Promise.resolve();
    },
    handleRenameFolder: async (folderId: string, newName: string, setModalOpen: (open: boolean) => void, setIdToRename: (id: string | null) => void) => {
      if (handleRenameFolder) {
        return handleRenameFolder(folderId, newName, setModalOpen, setIdToRename);
      }
      return Promise.resolve();
    },
    viewMode,
    isLoading
  };

  return (
    <FileExplorerProvider value={contextValue}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <FileExplorerLayout 
          filteredFiles={filteredFiles}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={handleUploadClick}
          onRefresh={onRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          onFolderChange={onFolderChange}
          onEditNote={handleEditNote}
          onCreateFolder={handleInitiateNewFolderWrapper}
        />
        
        <FileExplorerModalsContainer 
          // Upload modal
          isUploadModalOpen={isUploadModalOpen}
          setIsUploadModalOpen={setIsUploadModalOpen}
          
          // Category modals
          isAddCategoryModalOpen={isAddCategoryModalOpen}
          setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
          isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
          setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
          isRenameCategoryModalOpen={isRenameCategoryModalOpen}
          setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          categoryCurrentName={categoryCurrentName || ''}
          
          // Folder modals
          isAddFolderModalOpen={isAddFolderModalOpen}
          setIsAddFolderModalOpen={setIsAddFolderModalOpen}
          isAddToFolderModalOpen={isAddToFolderModalOpen}
          setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
          isDeleteFolderModalOpen={isDeleteFolderModalOpen}
          setIsDeleteFolderModalOpen={setIsDeleteFolderModalOpen}
          isRenameFolderModalOpen={isRenameFolderModalOpen}
          setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
          isEditNoteModalOpen={isEditNoteModalOpen}
          setIsEditNoteModalOpen={setIsEditNoteModalOpen}
          
          // Common props
          creatorId={creatorId}
          creatorName={creatorName}
          currentFolder={currentFolder}
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          folderCurrentName={folderCurrentName || ''}
          selectedFileIds={selectedFileIds}
          
          // Add the missing properties
          folderToDelete={folderToDelete}
          setFolderToDelete={setFolderToDelete}
          folderToRename={folderToRename}
          setFolderToRename={setFolderToRename}
          categoryToDelete={categoryToDelete}
          setCategoryToDelete={setCategoryToDelete}
          categoryToRename={categoryToRename}
          setCategoryToRename={setCategoryToRename}
          
          // Selection state
          targetFolderId={targetFolderId}
          setTargetFolderId={setTargetFolderId}
          targetCategoryId={targetCategoryId}
          setTargetCategoryId={setTargetCategoryId}
          selectedCategoryForNewFolder={selectedCategoryForNewFolder}
          
          // Data
          customFolders={customFolders}
          categories={availableCategories}
          editingFile={editingFile}
          editingNote={editingNote}
          setEditingNote={setEditingNote}
          
          // Callbacks
          onUploadComplete={onUploadComplete}
          handleCreateCategorySubmit={handleCreateCategorySubmit}
          handleCreateFolderSubmit={handleCreateFolderSubmit}
          handleAddToFolderSubmit={handleAddToFolderSubmit}
          handleDeleteCategory={handleDeleteCategory}
          handleDeleteFolder={handleDeleteFolder}
          handleRenameCategory={handleRenameCategory}
          handleRenameFolder={handleRenameFolder}
          handleSaveNote={handleSaveNote}
          onCreateNewCategory={handleCreateNewCategoryWrapper}
          onCreateNewFolder={handleCreateNewFolder}
        />
      </div>
    </FileExplorerProvider>
  );
};
