
import React, { useEffect, useState } from 'react';
import { FileExplorerLayout } from './layout/FileExplorerLayout';
import { useFileExplorer } from './useFileExplorer';
import { FileExplorerContent } from './FileExplorerContent';
import { FileExplorerHeader } from './FileExplorerHeader';
import { Category, CreatorFileType, Folder } from '@/types/fileTypes';
import { FileExplorerSidebar } from './FileExplorerSidebar';
import { FileExplorerProvider } from './context/FileExplorerContext';
import { useFileTags } from '@/hooks/useFileTags';
import { useToast } from '@/hooks/use-toast';
import { FileExplorerModalsWrapper } from './modals/FileExplorerModalsWrapper';

interface FileExplorerRefactoredProps {
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

export const FileExplorerRefactored: React.FC<FileExplorerRefactoredProps> = ({
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
  // Pass the creatorId to useFileTags
  const { 
    availableTags, 
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags
  } = useFileTags({ creatorId });
  
  const { toast } = useToast();
  
  // State for single file tagging
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  // State for tag modal
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
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
  
  // Handle tag selection for filtering (not for adding tags)
  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tagId)) {
        return prevTags.filter(id => id !== tagId);
      } else {
        return [...prevTags, tagId];
      }
    });
  };
  
  // Open the tag modal for a specific file
  const handleAddTagToFile = (file: CreatorFileType) => {
    setSingleFileForTagging(file);
    setIsAddTagModalOpen(true);
  };
  
  // Close the add tag modal and reset the single file
  useEffect(() => {
    if (!isAddTagModalOpen) {
      setSingleFileForTagging(null);
    }
  }, [isAddTagModalOpen]);
  
  // Open the add tag modal for multiple files
  const handleAddTagClick = () => {
    setSingleFileForTagging(null);
    setIsAddTagModalOpen(true);
  };
  
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
        onTagCreate: createTag,
        onAddTagClick: handleAddTagClick,
        onAddTagToFile: handleAddTagToFile,
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
            onTagCreate={createTag}
          />
        </div>
      </div>
      
      <FileExplorerModalsWrapper
        selectedFileIds={selectedFileIds}
        availableFolders={availableFolders}
        availableCategories={availableCategories}
        availableTags={availableTags}
        addTagToFiles={addTagToFiles}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
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
        isAddTagModalOpen={isAddTagModalOpen}
        setIsAddTagModalOpen={setIsAddTagModalOpen}
        onTagSelect={(tagId) => addTagToFiles(selectedFileIds, tagId)}
        onTagCreate={createTag}
        singleFileForTagging={singleFileForTagging}
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
