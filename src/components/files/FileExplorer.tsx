
import React, { useState } from 'react';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { DeleteCategoryModal } from './explorer/DeleteCategoryModal';
import { DeleteFolderModal } from './explorer/DeleteFolderModal';
import { useFileExplorer } from './explorer/useFileExplorer';
import { useFileOperations } from '@/hooks/file-operations';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { RenameCategoryModal } from './explorer/RenameCategoryModal';
import { RenameFolderModal } from './explorer/RenameFolderModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading?: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading = false,
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
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // State for rename modals
  const [isRenameCategoryModalOpen, setIsRenameCategoryModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [categoryCurrentName, setCategoryCurrentName] = useState('');
  const [folderCurrentName, setFolderCurrentName] = useState('');

  // File operations hook with confirmation modals
  const fileOperations = useFileOperations({
    creatorId,
    onFilesChanged: () => onRefresh(),
    setAvailableFolders: undefined,
    setAvailableCategories: undefined,
    setCurrentFolder: undefined,
    setCurrentCategory: undefined
  });

  const fileExplorerState = useFileExplorer({
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
    onRenameCategory,
    creatorId
  });

  const handleRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToRename || !categoryCurrentName || !onRenameCategory) return;
    
    try {
      await onRenameCategory(categoryToRename, categoryCurrentName);
      setIsRenameCategoryModalOpen(false);
      setCategoryToRename(null);
      onRefresh();
    } catch (error) {
      console.error("Error renaming category:", error);
    }
  };

  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !folderCurrentName || !onRenameFolder) return;
    
    try {
      await onRenameFolder(folderToRename, folderCurrentName);
      setIsRenameFolderModalOpen(false);
      setFolderToRename(null);
      onRefresh();
    } catch (error) {
      console.error("Error renaming folder:", error);
    }
  };

  // Handlers for confirmation-based deletions
  const handleConfirmDeleteCategory = async (categoryId: string): Promise<void> => {
    fileOperations.confirmDeleteCategory(categoryId);
  };

  const handleConfirmDeleteFolder = async (folderId: string): Promise<void> => {
    fileOperations.confirmDeleteFolder(folderId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <FileExplorerHeader
        creatorName={creatorName}
        viewMode={fileExplorerState.viewMode}
        setViewMode={fileExplorerState.setViewMode}
        searchQuery={fileExplorerState.searchQuery}
        setSearchQuery={fileExplorerState.setSearchQuery}
        selectedTypes={fileExplorerState.selectedTypes}
        setSelectedTypes={fileExplorerState.setSelectedTypes}
        selectedFileIds={fileExplorerState.selectedFileIds}
        setSelectedFileIds={fileExplorerState.setSelectedFileIds}
        isUploadModalOpen={fileExplorerState.isUploadModalOpen}
        setIsUploadModalOpen={fileExplorerState.setIsUploadModalOpen}
        handleAddToFolderClick={fileExplorerState.handleAddToFolderClick}
        isCreatorView={isCreatorView}
        onRefresh={onRefresh}
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar
          onFolderChange={onFolderChange}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onCreateCategory={onCreateCategory}
          onDeleteFolder={handleConfirmDeleteFolder}
          onDeleteCategory={handleConfirmDeleteCategory}
          onRenameFolder={onRenameFolder}
          onRenameCategory={onRenameCategory}
          isCreatorView={isCreatorView}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
        />
        
        <FileExplorerContent
          filteredFiles={fileExplorerState.filteredFiles}
          isLoading={isLoading || false}
          viewMode={fileExplorerState.viewMode}
          searchQuery={fileExplorerState.searchQuery}
          onSearchChange={fileExplorerState.setSearchQuery}
          selectedFileIds={fileExplorerState.selectedFileIds}
          setSelectedFileIds={fileExplorerState.setSelectedFileIds}
          onFileDeleted={fileExplorerState.handleFileDeleted}
          currentFolder={currentFolder}
          onAddToFolderClick={fileExplorerState.handleAddToFolderClick}
          onRemoveFromFolder={onRemoveFromFolder}
          handleEditNote={fileExplorerState.handleEditNote}
          selectedTypes={fileExplorerState.selectedTypes}
          setSelectedTypes={fileExplorerState.setSelectedTypes}
          selectedTags={fileExplorerState.selectedTags}
          setSelectedTags={fileExplorerState.setSelectedTags}
          availableTags={fileExplorerState.availableTags}
          onTagCreate={fileExplorerState.onTagCreate}
          onAddTagClick={fileExplorerState.handleAddTagClick}
          onAddTagToFile={fileExplorerState.handleAddTagToFile}
          recentlyUploadedIds={recentlyUploadedIds}
          isCreatorView={isCreatorView}
        />
      </div>
      
      <FileExplorerModals
        onRefresh={onRefresh}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
        creatorId={creatorId}
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        availableFolders={availableFolders}
        availableCategories={availableCategories}
        onCreateCategory={onCreateCategory}
        onCreateFolder={onCreateFolder}
        onAddFilesToFolder={onAddFilesToFolder}
        fileExplorerState={fileExplorerState}
      />

      {/* Delete Confirmation Modals */}
      <DeleteCategoryModal
        isOpen={fileOperations.showCategoryDeleteConfirm}
        onOpenChange={fileOperations.setShowCategoryDeleteConfirm}
        onConfirm={() => fileOperations.handleDeleteCategory()}
        isProcessing={fileOperations.isCategoryProcessing}
      />

      <DeleteFolderModal
        isOpen={fileOperations.showFolderDeleteConfirm}
        onOpenChange={fileOperations.setShowFolderDeleteConfirm}
        onConfirm={() => fileOperations.handleDeleteFolder()}
        isProcessing={fileOperations.isFolderProcessing}
      />

      {/* Separate modals for rename operations */}
      <RenameCategoryModal 
        isOpen={isRenameCategoryModalOpen}
        onOpenChange={setIsRenameCategoryModalOpen}
        categoryCurrentName={categoryCurrentName}
        newCategoryName={categoryCurrentName}
        setNewCategoryName={setCategoryCurrentName}
        onSubmit={handleRenameCategory}
        categoryToRename={categoryToRename}
        setCategoryToRename={setCategoryToRename}
      />

      <RenameFolderModal 
        isOpen={isRenameFolderModalOpen}
        onOpenChange={setIsRenameFolderModalOpen}
        folderCurrentName={folderCurrentName}
        newFolderName={folderCurrentName}
        setNewFolderName={setFolderCurrentName}
        onSubmit={handleRenameFolder}
        folderToRename={folderToRename}
        setFolderToRename={setFolderToRename}
      />
    </div>
  );
};
