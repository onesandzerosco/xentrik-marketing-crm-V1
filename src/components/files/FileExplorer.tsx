
import React, { useState } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { FileTag } from '@/hooks/useFileTags';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useFileExplorer } from './explorer/useFileExplorer';
import { SelectionProvider } from '@/context/selection-context';
import { ContextMenuProvider } from '@/context/context-menu';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState<boolean>(false);
  const [folderIdToAddTo, setFolderIdToAddTo] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [fileIdToDelete, setFileIdToDelete] = useState<string>('');
  const [fileToEdit, setFileToEdit] = useState<CreatorFileType | null>(null);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState<boolean>(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const handleAddToFolderClick = () => {
    if (selectedFileIds.length > 0) {
      setIsAddToFolderModalOpen(true);
    }
  };

  const handleFileDeleted = async (fileId: string): Promise<void> => {
    if (onFileDeleted) {
      return onFileDeleted(fileId);
    }
    return Promise.resolve();
  };

  const handleEditNoteWrap = (file: CreatorFileType) => {
    setFileToEdit(file);
    setIsEditNoteModalOpen(true);
  };

  const handleUploadClick = () => {
    onUploadStart();
    setIsUploadModalOpen(true);
  };

  const handleCreateFolderClick = () => {
    setIsCreateFolderModalOpen(true);
  };

  const explorerState = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onCreateCategory,
    onDeleteCategory,
    onRenameFolder,
    onRenameCategory,
    onCategoryChange,
  });

  // Create stub functions for the required context properties
  const handleInitiateNewCategory = () => {
    explorerState.setIsAddCategoryModalOpen(true);
  };

  const handleInitiateNewFolder = (categoryId?: string) => {
    if (categoryId) {
      explorerState.setSelectedCategoryForNewFolder(categoryId);
    }
    explorerState.setIsAddFolderModalOpen(true);
  };

  const handleDeleteCategoryClick = (categoryId: string) => {
    explorerState.setCategoryToDelete(categoryId);
    explorerState.setIsDeleteCategoryModalOpen(true);
  };

  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    explorerState.setCategoryToRename(categoryId);
    explorerState.setCategoryCurrentName(currentName);
    explorerState.setIsRenameCategoryModalOpen(true);
  };

  const handleDeleteFolderClick = (folderId: string) => {
    explorerState.setFolderToDelete(folderId);
    explorerState.setIsDeleteFolderModalOpen(true);
  };

  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    explorerState.setFolderToRename(folderId);
    explorerState.setFolderCurrentName(currentName);
    explorerState.setIsRenameFolderModalOpen(true);
  };

  const handleCreateFolder = explorerState.handleCreateFolderSubmit;
  const handleAddFilesToFolder = explorerState.handleAddToFolderSubmit;
  const handleDeleteFolder = explorerState.handleDeleteFolder;
  const handleCreateCategory = explorerState.handleCreateCategorySubmit;
  const handleDeleteCategory = explorerState.handleDeleteCategory;
  const handleRenameFolder = explorerState.handleRenameFolder;
  const handleRenameCategory = explorerState.handleRenameCategory;
  const handleEditNote = explorerState.handleSaveNote;

  const contextValue = {
    selectedFileIds,
    setSelectedFileIds,
    isCreatorView,
    currentFolder,
    currentCategory,
    onCategoryChange,
    availableFolders,
    availableCategories,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    handleAddToFolderClick,
    creatorName,
    isLoading,
    creatorId: creatorId,
    viewMode: viewMode,
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    handleDeleteCategoryClick,
    handleRenameCategoryClick,
    handleDeleteFolderClick,
    handleRenameFolderClick
  };

  return (
    <ContextMenuProvider>
      <SelectionProvider>
        <FileExplorerProvider value={contextValue}>
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
            targetFolderId={folderIdToAddTo}
            setTargetFolderId={setFolderIdToAddTo}
            targetCategoryId={currentCategory || ''}
            setTargetCategoryId={(id: string) => onCategoryChange(id || null)}
            handleAddToFolderSubmit={explorerState.handleAddToFolderSubmit}
            onAddFilesToFolder={onAddFilesToFolder}
            isAddCategoryModalOpen={explorerState.isAddCategoryModalOpen}
            setIsAddCategoryModalOpen={explorerState.setIsAddCategoryModalOpen}
            newCategoryName={explorerState.newCategoryName}
            setNewCategoryName={explorerState.setNewCategoryName}
            isDeleteCategoryModalOpen={explorerState.isDeleteCategoryModalOpen}
            setIsDeleteCategoryModalOpen={explorerState.setIsDeleteCategoryModalOpen}
            categoryToDelete={explorerState.categoryToDelete}
            setCategoryToDelete={explorerState.setCategoryToDelete}
            isRenameCategoryModalOpen={explorerState.isRenameCategoryModalOpen}
            setIsRenameCategoryModalOpen={explorerState.setIsRenameCategoryModalOpen}
            categoryToRename={explorerState.categoryToRename}
            setCategoryToRename={explorerState.setCategoryToRename}
            categoryCurrentName={explorerState.categoryCurrentName}
            isAddFolderModalOpen={explorerState.isAddFolderModalOpen}
            setIsAddFolderModalOpen={explorerState.setIsAddFolderModalOpen}
            newFolderName={explorerState.newFolderName}
            setNewFolderName={explorerState.setNewFolderName}
            selectedCategoryForNewFolder={explorerState.selectedCategoryForNewFolder}
            isDeleteFolderModalOpen={explorerState.isDeleteFolderModalOpen}
            setIsDeleteFolderModalOpen={explorerState.setIsDeleteFolderModalOpen}
            folderToDelete={explorerState.folderToDelete}
            setFolderToDelete={explorerState.setFolderToDelete}
            isRenameFolderModalOpen={explorerState.isRenameFolderModalOpen}
            setIsRenameFolderModalOpen={explorerState.setIsRenameFolderModalOpen}
            folderToRename={explorerState.folderToRename}
            setFolderToRename={explorerState.setFolderToRename}
            folderCurrentName={explorerState.folderCurrentName}
            isEditNoteModalOpen={isEditNoteModalOpen}
            setIsEditNoteModalOpen={setIsEditNoteModalOpen}
            editingFile={fileToEdit}
            editingNote={fileToEdit?.description || ''}
            setEditingNote={(note: string) => {
              if (fileToEdit) {
                setFileToEdit({ ...fileToEdit, description: note });
              }
            }}
            handleCreateFolderSubmit={explorerState.handleCreateFolderSubmit}
            handleDeleteFolder={explorerState.handleDeleteFolder}
            handleRenameFolder={explorerState.handleRenameFolder}
            handleCreateCategorySubmit={explorerState.handleCreateCategorySubmit}
            handleDeleteCategory={explorerState.handleDeleteCategory}
            handleRenameCategory={explorerState.handleRenameCategory}
            handleSaveNote={explorerState.handleSaveNote}
            handleCreateNewFolder={handleCreateFolderClick}
            onEditNote={explorerState.handleSaveNote}
            availableCategories={availableCategories}
            onFileDeleted={handleFileDeleted}
          />
        </FileExplorerProvider>
      </SelectionProvider>
    </ContextMenuProvider>
  );
};
