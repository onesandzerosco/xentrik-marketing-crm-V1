import React from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileExplorer } from './useFileExplorer';
import { FileExplorerLayout } from './layout/FileExplorerLayout';
import { FileExplorerModals } from './FileExplorerModals';
import { FileExplorerProvider } from './context/FileExplorerContext';

interface FileExplorerWrapperProps {
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

export const FileExplorerWrapper: React.FC<FileExplorerWrapperProps> = (props) => {
  const {
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
  } = props;

  // Custom folders (excluding 'all' and 'unsorted')
  const customFolders = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );

  const explorerState = useFileExplorer({
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

  // Create wrapper functions for modal operations
  const {
    selectedFileIds,
    setSelectedFileIds,
    
    // Category modals
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
    setCategoryCurrentName,
    
    // Folder modals
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
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName, 
    setFolderCurrentName,
    
    // File notes
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    
    // File filtering
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles,
    
    // Upload modal
    isUploadModalOpen,
    setIsUploadModalOpen,
    
    // Handlers
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
    handleEditNote,
    handleSaveNote,
  } = explorerState;

  // Handle file upload button click
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    setIsUploadModalOpen(true);
  };

  // Create wrapper functions for rename handlers that correctly pass the required arguments
  const handleRenameCategoryWrapper = () => {
    if (categoryToRename && categoryCurrentName) {
      handleRenameCategory(
        categoryToRename, 
        categoryCurrentName, 
        setIsRenameCategoryModalOpen, 
        setCategoryToRename
      );
    }
  };
  
  const handleRenameFolderWrapper = () => {
    if (folderToRename && folderCurrentName) {
      handleRenameFolder(
        folderToRename, 
        folderCurrentName, 
        setIsRenameFolderModalOpen, 
        setFolderToRename
      );
    }
  };

  // Create wrapper function for handleCreateNewCategory that doesn't need parameters
  const handleCreateNewCategoryWrapper = () => {
    handleCreateNewCategory();
  };
  
  // Create wrapper function for handleInitiateNewFolder that doesn't need parameters
  const handleInitiateNewFolderWrapper = () => {
    handleInitiateNewFolder(currentCategory || '');
  };

  // Create wrapper function for onCreateNewFolder that has the correct signature
  const handleCreateNewFolderWrapper = () => {
    handleCreateNewFolder();
  };

  // Fix for the TypeScript error - create a wrapper function for handleDeleteCategory
  // that matches the expected function signature (no parameters)
  const handleDeleteCategoryWrapper = () => {
    // This wrapper doesn't actually call the delete function directly
    // It's just a placeholder to match the expected type signature
    // The actual delete functionality will be triggered by the modals
  };

  // Context value
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
          onCreateFolder={handleCreateNewFolderWrapper}
        />
        
        <FileExplorerModals 
          // Upload modal
          isUploadModalOpen={isUploadModalOpen}
          setIsUploadModalOpen={setIsUploadModalOpen}
          creatorId={creatorId}
          creatorName={creatorName}
          currentFolder={currentFolder}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          
          // Category modals
          isAddCategoryModalOpen={isAddCategoryModalOpen}
          setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
          isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
          setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
          isRenameCategoryModalOpen={isRenameCategoryModalOpen}
          setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          categoryToDelete={categoryToDelete}
          setCategoryToDelete={setCategoryToDelete}
          categoryCurrentName={categoryCurrentName || ''}
          
          // Folder modals
          isAddFolderModalOpen={isAddFolderModalOpen}
          setIsAddFolderModalOpen={setIsAddFolderModalOpen}
          isAddToFolderModalOpen={isAddToFolderModalOpen}
          setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
          isDeleteFolderModalOpen={isDeleteFolderModalOpen}
          setIsDeleteFolderModalOpen={setIsDeleteFolderModalOpen}
          isRenameFolderModalOpen={isRenameFolderModalOpen}
          setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
          isEditNoteModalOpen={isEditNoteModalOpen}
          setIsEditNoteModalOpen={setIsEditNoteModalOpen}
          
          // Common props
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          selectedCategoryForNewFolder={selectedCategoryForNewFolder}
          setSelectedCategoryForNewFolder={setSelectedCategoryForNewFolder}
          folderCurrentName={folderCurrentName || ''}
          folderToDelete={folderToDelete}
          setFolderToDelete={setFolderToDelete}
          folderToRename={folderToRename}
          setFolderToRename={setFolderToRename}
          selectedFileIds={selectedFileIds}
          
          // Selection state
          targetFolderId={targetFolderId}
          setTargetFolderId={setTargetFolderId}
          targetCategoryId={targetCategoryId}
          setTargetCategoryId={setTargetCategoryId}
          
          // Data
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
          handleRenameCategory={handleRenameCategoryWrapper}
          handleRenameFolder={handleRenameFolderWrapper}
          handleSaveNote={handleSaveNote}
          onCreateNewCategory={handleCreateNewCategoryWrapper}
          onCreateNewFolder={handleCreateNewFolderWrapper}
        />
      </div>
    </FileExplorerProvider>
  );
};
