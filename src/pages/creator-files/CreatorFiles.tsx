
import React from 'react';
import { useParams } from 'react-router-dom';
import { useCreatorFilesState } from './hooks/useCreatorFilesState';
import { CreatorNotFound } from './components/CreatorNotFound';
import { FileExplorer } from '@/components/files/FileExplorer';

const CreatorFiles: React.FC = () => {
  const { id } = useParams();
  const {
    creator,
    isCurrentUserCreator,
    error,
    isLoading,
    filteredFiles,
    currentFolder,
    setCurrentFolder,
    currentCategory,
    handleCategoryChange,
    availableFolders,
    availableCategories,
    recentlyUploadedIds,
    handleFilesUploaded,
    handleNewUploadStart,
    handleAddFilesToFolderWrapper,
    createFolderWrapper,
    createCategoryWrapper,
    handleDeleteFolder,
    handleDeleteCategory,
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory,
    refetch
  } = useCreatorFilesState(id);

  if (!creator) {
    return <CreatorNotFound />;
  }

  return (
    <FileExplorer 
      files={filteredFiles}
      creatorName={creator?.name || ''}
      creatorId={creator?.id || ''}
      isLoading={isLoading}
      onRefresh={refetch}
      onFolderChange={setCurrentFolder}
      currentFolder={currentFolder}
      onCategoryChange={handleCategoryChange}
      currentCategory={currentCategory}
      availableFolders={availableFolders}
      availableCategories={availableCategories}
      isCreatorView={isCurrentUserCreator}
      onUploadComplete={handleFilesUploaded}
      onUploadStart={handleNewUploadStart}
      recentlyUploadedIds={recentlyUploadedIds}
      onCreateFolder={createFolderWrapper}
      onCreateCategory={createCategoryWrapper}
      onAddFilesToFolder={handleAddFilesToFolderWrapper}
      onDeleteFolder={handleDeleteFolder}
      onDeleteCategory={handleDeleteCategory}
      onRemoveFromFolder={handleRemoveFromFolder}
      onRenameFolder={handleRenameFolder}
      onRenameCategory={handleRenameCategory}
    />
  );
};

export default CreatorFiles;
