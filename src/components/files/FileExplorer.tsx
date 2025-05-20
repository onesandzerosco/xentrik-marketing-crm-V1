
import React, { useState } from 'react';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { Category, CreatorFileType, Folder } from '@/types/fileTypes';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { useTagOperations } from '@/hooks/useTagOperations';
import { NoteEditModal } from './explorer/modals/NoteEditModal';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  currentFolder: string;
  onFolderChange: (folderId: string) => void;
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  currentFolder,
  onFolderChange,
  currentCategory,
  onCategoryChange,
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
  // Get tag operations from the custom hook
  const {
    availableTags,
    selectedTags,
    setSelectedTags,
    handleTagSelect,
    handleCreateTag,
    handleRemoveTag,
    handleAddTagToFile,
    handleAddTagClick,
    singleFileForTagging,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    filterFilesByTags
  } = useTagOperations({
    creatorId,
    onRefresh
  });

  // Get file explorer functionality from the hook
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    handleAddToFolderClick,
    handleAddToFolderSubmit,
    handleCreateNewFolder,
    handleCreateFolderSubmit,
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
    filteredFiles: baseFilteredFiles,
    isUploadModalOpen,
    setIsUploadModalOpen
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder: onCreateFolder || (async () => {}),
    onCreateCategory: onCreateCategory || (async () => {}),
    onAddFilesToFolder: onAddFilesToFolder || (async () => {}),
    onDeleteFolder: onDeleteFolder || (async () => {}),
    onDeleteCategory: onDeleteCategory || (async () => {}),
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory
  });

  // Apply tag filtering to the already filtered files
  const filteredFiles = filterFilesByTags(baseFilteredFiles, selectedTags);
  
  return (
    <FileExplorerProvider
      value={{
        filteredFiles,
        selectedFileIds,
        setSelectedFileIds,
        onFileDeleted: handleFileDeleted,
        isLoading,
        viewMode,
        setViewMode,
        isCreatorView,
        currentFolder,
        onFolderChange,
        searchQuery,
        setSearchQuery,
        selectedTypes,
        setSelectedTypes,
        isUploadModalOpen,
        setIsUploadModalOpen,
        onUploadComplete,
        onUploadStart,
        creatorId,
        creatorName,
        onRefresh,
        selectedTags,
        setSelectedTags,
        availableTags,
        onTagSelect: handleTagSelect,
        onTagCreate: handleCreateTag,
        onAddTagClick: handleAddTagClick,
        onAddTagToFile: handleAddTagToFile,
        onTagRemove: handleRemoveTag,
        currentCategory,
        onCategoryChange,
        onCreateCategory,
        onRenameFolder,
        onRenameCategory
      }}
    >
      <div className="flex flex-col h-full">
        <FileExplorerHeader 
          creatorName={creatorName}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={() => setIsUploadModalOpen(true)}
          isCreatorView={isCreatorView}
          onRefresh={onRefresh}
          selectedFileIds={selectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
        />
        
        <div className="flex gap-4 mt-4 flex-1 overflow-hidden">
          <FileExplorerSidebar 
            onFolderChange={onFolderChange}
            currentFolder={currentFolder}
            onCategoryChange={onCategoryChange}
            currentCategory={currentCategory}
            availableFolders={availableFolders}
            availableCategories={availableCategories}
            onCreateCategory={onCreateCategory}
            onDeleteFolder={onDeleteFolder}
            onDeleteCategory={onDeleteCategory}
            onRenameFolder={onRenameFolder}
            onRenameCategory={onRenameCategory}
            isCreatorView={isCreatorView}
          />
          
          <FileExplorerContent 
            isLoading={isLoading}
            filteredFiles={filteredFiles}
            viewMode={viewMode}
            isCreatorView={isCreatorView}
            onFilesChanged={onRefresh}
            onFileDeleted={handleFileDeleted}
            recentlyUploadedIds={recentlyUploadedIds}
            selectedFileIds={selectedFileIds}
            setSelectedFileIds={setSelectedFileIds}
            onAddToFolderClick={handleAddToFolderClick}
            onAddTagClick={handleAddTagClick}
            onAddTagToFile={handleAddTagToFile}
            currentFolder={currentFolder}
            currentCategory={currentCategory}
            onCreateFolder={handleCreateNewFolder}
            onUploadClick={() => setIsUploadModalOpen(true)}
            availableFolders={availableFolders}
            onRemoveFromFolder={onRemoveFromFolder}
            onEditNote={handleEditNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            onTagCreate={handleCreateTag}
          />
        </div>
      </div>
      
      <FileExplorerModals 
        selectedFileIds={selectedFileIds}
        customFolders={availableFolders}
        categories={availableCategories}
        availableTags={availableTags}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        isAddTagModalOpen={isAddTagModalOpen}
        setIsAddTagModalOpen={setIsAddTagModalOpen}
        onTagSelect={handleTagSelect}
        onTagCreate={handleCreateTag}
        onTagRemove={handleRemoveTag}
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
        setSelectedCategoryForNewFolder={setSelectedCategoryForNewFolder}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        onAddFilesToFolder={onAddFilesToFolder}
        handleCreateNewFolder={handleCreateNewFolder}
        singleFileForTagging={singleFileForTagging}
      />
      
      {/* Note Edit Modal */}
      <NoteEditModal
        isEditNoteModalOpen={isEditNoteModalOpen}
        setIsEditNoteModalOpen={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        handleSaveNote={handleSaveNote}
      />
    </FileExplorerProvider>
  );
};
