
import React, { useState } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { FileTag } from '@/hooks/useFileTags';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useFileExplorer } from './explorer/useFileExplorer';

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
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onUploadStart: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
  onFileDeleted?: (fileId: string) => Promise<void>;
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
  onRenameCategory,
  selectedTags,
  setSelectedTags,
  availableTags,
  onTagCreate,
  onFileDeleted
}) => {
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    selectedFileIds,
    setSelectedFileIds,
    isUploadModalOpen,
    setIsUploadModalOpen,
    handleAddToFolderClick,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    selectedFolderId,
    setSelectedFolderId,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    newFolderName,
    setNewFolderName,
    folderToDelete,
    setFolderToDelete,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    isCreateCategoryModalOpen,
    setIsCreateCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    categoryToDelete,
    setCategoryToDelete,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    folderToRename,
    setFolderToRename,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    categoryToRename,
    setCategoryToRename,
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    fileToEdit,
    setFileToEdit,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    handleCreateFolder,
    handleAddFilesToFolder,
    handleDeleteFolder,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory,
    handleEditNote,
  } = useFileExplorer({
    onRefresh,
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onCreateCategory,
    onDeleteCategory,
    onRenameFolder,
    onRenameCategory,
  });

  const handleEditNoteWrap = (file: CreatorFileType) => {
    setFileToEdit(file);
    setIsEditNoteModalOpen(true);
  };

  const handleUploadClick = () => {
    onUploadStart();
    setIsUploadModalOpen(true);
  };

  const handleCreateFolderClick = () => {
    setNewFolderName('');
    setIsCreateFolderModalOpen(true);
  };

  return (
    <FileExplorerProvider
      files={files}
      currentFolder={currentFolder}
      currentCategory={currentCategory}
      availableFolders={availableFolders}
      availableCategories={availableCategories}
      onFolderChange={onFolderChange}
      onCategoryChange={onCategoryChange}
      selectedFileIds={selectedFileIds}
      setSelectedFileIds={setSelectedFileIds}
      isCreatorView={isCreatorView}
      creatorName={creatorName}
      isLoading={isLoading}
      onDeleteFolder={handleDeleteFolder}
      onDeleteCategory={handleDeleteCategory}
      onRemoveFromFolder={onRemoveFromFolder}
    >
      <FileExplorerLayout
        filteredFiles={files}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={handleUploadClick}
        onRefresh={onRefresh}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        onFolderChange={onFolderChange}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
        onTagCreate={onTagCreate}
        onEditNote={handleEditNoteWrap}
        onCreateFolder={handleCreateFolderClick}
      />
      <FileExplorerModals
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        creatorId={creatorId}
        onUploadComplete={onUploadComplete}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        selectedFileIds={selectedFileIds}
        availableFolders={availableFolders}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        onAddFilesToFolder={handleAddFilesToFolder}
        isCreateFolderModalOpen={isCreateFolderModalOpen}
        setIsCreateFolderModalOpen={setIsCreateFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        currentCategory={currentCategory}
        isDeleteFolderModalOpen={isDeleteFolderModalOpen}
        setIsDeleteFolderModalOpen={setIsDeleteFolderModalOpen}
        folderToDelete={folderToDelete}
        isCreateCategoryModalOpen={isCreateCategoryModalOpen}
        setIsCreateCategoryModalOpen={setIsCreateCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onCreateCategory={handleCreateCategory}
        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
        setIsDeleteCategoryModalOpen={setIsDeleteCategoryModalOpen}
        categoryToDelete={categoryToDelete}
        isRenameFolderModalOpen={isRenameFolderModalOpen}
        setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
        folderToRename={folderToRename}
        onRenameFolder={handleRenameFolder}
        isRenameCategoryModalOpen={isRenameCategoryModalOpen}
        setIsRenameCategoryModalOpen={setIsRenameCategoryModalOpen}
        categoryToRename={categoryToRename}
        onRenameCategory={handleRenameCategory}
        fileToEdit={fileToEdit}
        isEditNoteModalOpen={isEditNoteModalOpen}
        setIsEditNoteModalOpen={setIsEditNoteModalOpen}
        onEditNote={handleEditNote}
        onFileDeleted={onFileDeleted}
      />
    </FileExplorerProvider>
  );
};
