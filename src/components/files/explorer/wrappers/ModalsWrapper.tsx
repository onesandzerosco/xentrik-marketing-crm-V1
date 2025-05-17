
import React from 'react';
import { FileExplorerModals } from '../FileExplorerModals';
import { ModalWrapperProps } from '../types';

export const ModalsWrapper: React.FC<ModalWrapperProps> = ({
  explorerState,
  creatorId,
  creatorName,
  currentFolder,
  availableFolders,
  availableCategories,
  onUploadComplete
}) => {
  const {
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
    categoryCurrentName,
    
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
    folderCurrentName,
    setFolderCurrentName,
    folderToRename,
    setFolderToRename,
    
    // File notes
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    
    // Handlers
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleCreateNewCategory,
    handleCreateNewFolder,
    handleSaveNote,
    selectedFileIds
  } = explorerState;

  // Wrapper functions for handlers with correct signatures
  const handleDeleteCategoryWrapper = () => {
    if (categoryToDelete) {
      explorerState.handleDeleteCategory(categoryToDelete);
    }
  };

  const handleDeleteFolderWrapper = () => {
    explorerState.handleDeleteFolder();
  };

  const handleRenameCategoryWrapper = () => {
    if (explorerState.categoryToRename && explorerState.categoryCurrentName) {
      explorerState.handleRenameCategory(
        explorerState.categoryToRename, 
        explorerState.categoryCurrentName, 
        setIsRenameCategoryModalOpen, 
        explorerState.setCategoryToRename
      );
    }
  };
  
  const handleRenameFolderWrapper = () => {
    if (explorerState.folderToRename && explorerState.folderCurrentName) {
      explorerState.handleRenameFolder(
        explorerState.folderToRename, 
        explorerState.folderCurrentName, 
        setIsRenameFolderModalOpen, 
        explorerState.setFolderToRename
      );
    }
  };

  return (
    <FileExplorerModals 
      // Category modals
      isAddCategoryModalOpen={isAddCategoryModalOpen}
      setIsAddCategoryModalOpen={setIsAddCategoryModalOpen}
      newCategoryName={newCategoryName}
      setNewCategoryName={setNewCategoryName}
      isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
      setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
      categoryToDelete={categoryToDelete}
      setCategoryToDelete={setCategoryToDelete}
      isRenameCategoryModalOpen={isRenameCategoryModalOpen}
      setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
      categoryCurrentName={categoryCurrentName || ''}
      
      // Folder modals
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
      folderToDelete={folderToDelete}
      setFolderToDelete={setFolderToDelete}
      isRenameFolderModalOpen={isRenameFolderModalOpen}
      setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
      folderCurrentName={folderCurrentName || ''}
      folderToRename={folderToRename}
      setFolderToRename={setFolderToRename}
      
      // File notes
      isEditNoteModalOpen={isEditNoteModalOpen}
      setIsEditNoteModalOpen={setIsEditNoteModalOpen}
      editingFile={editingFile}
      editingNote={editingNote}
      setEditingNote={setEditingNote}
      
      // Upload modal
      isUploadModalOpen={explorerState.isUploadModalOpen}
      setIsUploadModalOpen={explorerState.setIsUploadModalOpen}
      creatorId={creatorId}
      creatorName={creatorName}
      currentFolder={currentFolder}
      
      // Data
      availableFolders={availableFolders}
      availableCategories={availableCategories}
      selectedFileIds={selectedFileIds}
      
      // Callbacks
      onUploadComplete={onUploadComplete}
      handleCreateCategorySubmit={handleCreateCategorySubmit}
      handleCreateFolderSubmit={handleCreateFolderSubmit}
      handleAddToFolderSubmit={handleAddToFolderSubmit}
      handleDeleteCategory={handleDeleteCategoryWrapper}
      handleDeleteFolder={handleDeleteFolderWrapper}
      handleRenameCategory={handleRenameCategoryWrapper}
      handleRenameFolder={handleRenameFolderWrapper}
      handleSaveNote={handleSaveNote}
      onCreateNewCategory={handleCreateNewCategory}
      onCreateNewFolder={handleCreateNewFolder}
    />
  );
};
