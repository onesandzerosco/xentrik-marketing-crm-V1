import React from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerModals } from './explorer/FileExplorerModals';

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
    // File selection
    selectedFileIds,
    setSelectedFileIds,
    
    // Categories
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
    
    // Folders
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
    
    // Notes
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    
    // Filtering
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles,
    
    // Upload
    isUploadModalOpen,
    setIsUploadModalOpen,
    
    // Category operations
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    
    // Operations
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

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <FileExplorerHeader 
        creatorName={creatorName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={handleUploadClick}
        isCreatorView={isCreatorView}
        onRefresh={onRefresh}
        selectedFileIds={selectedFileIds}
        onAddToFolderClick={handleAddToFolderClick}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar 
          categories={availableCategories}
          folders={availableFolders}
          currentCategory={currentCategory}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          onFolderChange={onFolderChange}
          onInitiateNewCategory={handleInitiateNewCategory}
          onInitiateNewFolder={handleInitiateNewFolder}
          onDeleteCategory={handleDeleteCategoryClick}
          onRenameCategory={handleRenameCategoryClick}
          onDeleteFolder={handleDeleteFolderClick}
          onRenameFolder={handleRenameFolderClick}
          selectedFileIds={selectedFileIds}
        />
        
        <FileExplorerContent 
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          filteredFiles={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={onRefresh}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCreateFolder={handleInitiateNewFolder}
          availableFolders={availableFolders}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={handleEditNote}
        />
      </div>
      
      <FileExplorerModals 
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
        onCreateNewCategory={handleCreateNewCategory}
        onCreateNewFolder={handleCreateNewFolder}
      />
    </div>
  );
};
