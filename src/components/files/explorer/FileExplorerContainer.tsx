
import React from 'react';
import { FileExplorerLayout } from './layout/FileExplorerLayout';
import { FileExplorerContent } from './FileExplorerContent';
import { FileExplorerHeader } from './FileExplorerHeader';
import { FileExplorerSidebar } from './FileExplorerSidebar';
import { FileExplorerModals } from './FileExplorerModals';
import { EditNoteModal } from './NoteModals';
import { useFileExplorerContext } from './context/FileExplorerContext';
import { useExplorerExtendedContext } from './hooks/useExplorerExtendedContext';

export const FileExplorerContainer = () => {
  const {
    filteredFiles,
    selectedFileIds,
    setSelectedFileIds,
    onFileDeleted,
    isLoading,
    viewMode,
    setViewMode,
    isCreatorView,
    currentFolder,
    onFolderChange,
    currentCategory,
    onCategoryChange,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isUploadModalOpen,
    setIsUploadModalOpen,
    onUploadComplete,
    onRefresh,
    creatorName,
    creatorId,
    availableTags,
    selectedTags,
    setSelectedTags,
    onTagSelect,
    onTagCreate,
    onAddTagClick,
    onAddTagToFile
  } = useFileExplorerContext();
  
  // Additional hooks for modals and state
  const {
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    handleAddToFolderClick,
    handleCreateNewFolder,
    handleAddToFolderSubmit,
    handleCreateFolderSubmit,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    isAddFolderModalOpen, 
    setIsAddFolderModalOpen,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    availableFolders,
    availableCategories,
    onCreateCategory,
    onDeleteCategory,
    onDeleteFolder,
    onRenameCategory,
    onRenameFolder,
    onRemoveFromFolder,
    onAddFilesToFolder,
    recentlyUploadedIds,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    singleFileForTagging,
    onTagRemove
  } = useExplorerExtendedContext();

  return (
    <FileExplorerLayout>
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
          onFileDeleted={onFileDeleted}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
          onAddTagClick={onAddTagClick}
          onAddTagToFile={onAddTagToFile}
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
          onTagCreate={onTagCreate}
        />
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
        onTagSelect={onTagSelect}
        onTagCreate={onTagCreate}
        onTagRemove={onTagRemove}
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
      
      <EditNoteModal 
        isOpen={isEditNoteModalOpen}
        onOpenChange={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onSave={handleSaveNote}
      />
    </FileExplorerLayout>
  );
};
