
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
  });

  const {
    // Extract values from explorerState
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
    handleCreateFolder,
    handleAddFilesToFolder,
    handleDeleteFolder,
    handleCreateCategory,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory,
    handleEditNote,
  } = explorerState;

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
    isLoading
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
            selectedFolderId={folderIdToAddTo}
            setSelectedFolderId={setFolderIdToAddTo}
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
            onFileDeleted={handleFileDeleted}
          />
        </FileExplorerProvider>
      </SelectionProvider>
    </ContextMenuProvider>
  );
};
