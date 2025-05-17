
import React from 'react';
import { useFileExplorer } from './useFileExplorer';
import { FileExplorerLayout } from './layout/FileExplorerLayout';
import { ContextProviderWrapper } from './wrappers/ContextProviderWrapper';
import { ModalsWrapper } from './wrappers/ModalsWrapper';
import { ExplorerActionsWrapper } from './wrappers/ExplorerActionsWrapper';
import { FileExplorerWrapperProps } from './types';

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

  // Get the explorer state through the hook
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

  // Get actions from the wrapper
  const { handleUploadClick } = ExplorerActionsWrapper({
    explorerState,
    onUploadStart
  });

  // Context value for the provider
  const contextValue = {
    selectedFileIds: explorerState.selectedFileIds,
    setSelectedFileIds: explorerState.setSelectedFileIds,
    currentFolder,
    currentCategory,
    handleAddToFolderClick: explorerState.handleAddToFolderClick,
    handleInitiateNewCategory: explorerState.handleInitiateNewCategory,
    handleInitiateNewFolder: explorerState.handleInitiateNewFolder,
    creatorName,
    creatorId,
    isCreatorView,
    availableFolders,
    availableCategories,
    onRemoveFromFolder,
    viewMode: explorerState.viewMode,
    isLoading
  };

  return (
    <ContextProviderWrapper contextValue={contextValue}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <FileExplorerLayout 
          filteredFiles={explorerState.filteredFiles}
          viewMode={explorerState.viewMode}
          setViewMode={explorerState.setViewMode}
          onUploadClick={handleUploadClick}
          onRefresh={onRefresh}
          searchQuery={explorerState.searchQuery}
          onSearchChange={explorerState.setSearchQuery}
          selectedTypes={explorerState.selectedTypes}
          setSelectedTypes={explorerState.setSelectedTypes}
          onFolderChange={onFolderChange}
          onEditNote={explorerState.handleEditNote}
          onCreateFolder={explorerState.handleCreateNewFolder}
        />
        
        <ModalsWrapper
          explorerState={explorerState}
          creatorId={creatorId}
          creatorName={creatorName}
          currentFolder={currentFolder}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onUploadComplete={onUploadComplete}
        />
      </div>
    </ContextProviderWrapper>
  );
};
