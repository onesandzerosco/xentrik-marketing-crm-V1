
import React, { useState } from 'react';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { useFileSelection } from './explorer/hooks/useFileSelection';
import { useFileFilters } from './explorer/hooks/useFileFilters';
import { useFileNotes } from './explorer/hooks/useFileNotes';
import { useFolderModals } from './explorer/hooks/useFolderModals';
import { useUploadModal } from './explorer/hooks/useUploadModal';
import { CreatorFileType, FileOperationsHandlers } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';
import { AddTagModal } from './explorer/modals/TagModals';

interface FileExplorerProps extends FileOperationsHandlers {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  isCreatorView: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Array<{ id: string; name: string; categoryId: string }>;
  availableCategories: Array<{ id: string; name: string }>;
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onUploadStart: () => void;
  recentlyUploadedIds: string[];
  // Tag related props
  availableTags?: FileTag[];
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  onAddTagToFiles?: (fileIds: string[], tagId: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  isCreatorView,
  onRefresh,
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
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
  // Tag related props
  availableTags = [],
  selectedTags = [],
  setSelectedTags = () => {},
  onTagCreate,
  onAddTagToFiles
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const { selectedFileIds, setSelectedFileIds } = useFileSelection();
  const { searchQuery, selectedTypes, setSelectedTypes, onSearchChange } = useFileFilters();
  const { isEditNoteModalOpen, fileToEdit, openEditNoteModal, closeEditNoteModal } = useFileNotes();
  
  // Use existing hooks
  const {
    isFolderModalOpen,
    isCategoryModalOpen,
    isAddToFolderModalOpen,
    isDeleteFolderModalOpen,
    folderToDeleteId,
    isDeleteCategoryModalOpen,
    categoryToDeleteId,
    isRenameFolderModalOpen,
    folderToRenameId,
    isRenameCategoryModalOpen,
    categoryToRenameId,
    openFolderModal,
    openCategoryModal,
    openAddToFolderModal,
    openDeleteFolderModal,
    openDeleteCategoryModal,
    openRenameFolderModal,
    openRenameCategoryModal,
    closeFolderModal,
    closeCategoryModal,
    closeAddToFolderModal,
    closeDeleteFolderModal,
    closeDeleteCategoryModal,
    closeRenameFolderModal,
    closeRenameCategoryModal
  } = useFolderModals();
  
  // Use the upload modal hook
  const { isUploadModalOpen, openUploadModal, closeUploadModal } = useUploadModal();

  const handleFileEdited = (fileId: string, description: string) => {
    // In a real implementation, update the file in the database
    onRefresh();
  };

  const handleTagSelect = async (tagId: string) => {
    if (selectedFileIds.length === 0) return;
    
    if (onAddTagToFiles) {
      await onAddTagToFiles(selectedFileIds, tagId);
      // Clear selection after tagging
      setSelectedFileIds([]);
    }
  };

  return (
    <FileExplorerLayout>
      <FileExplorerHeader
        creatorName={creatorName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onRefresh={onRefresh}
        onUploadClick={openUploadModal}
        isCreatorView={isCreatorView}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar 
          currentFolder={currentFolder} 
          currentCategory={currentCategory}
          onFolderChange={onFolderChange}
          onCategoryChange={onCategoryChange}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onCreateFolder={openFolderModal}
          onCreateCategory={openCategoryModal}
          onDeleteFolder={openDeleteFolderModal}
          onDeleteCategory={openDeleteCategoryModal}
          onRenameFolder={openRenameFolderModal}
          onRenameCategory={openRenameCategoryModal}
          isCreatorView={isCreatorView}
        />
        
        <FileExplorerContent
          isLoading={isLoading}
          filteredFiles={files}
          viewMode={viewMode}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={() => onRefresh()}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={openAddToFolderModal}
          onAddTagClick={() => setIsTagModalOpen(true)}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCreateFolder={onCreateFolder && (() => openFolderModal())}
          availableFolders={availableFolders}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={(file) => openEditNoteModal(file)}
          onAddTag={(file) => {
            setSelectedFileIds([file.id]);
            setIsTagModalOpen(true);
          }}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          onTagCreate={onTagCreate}
        />
      </div>
      
      <FileExplorerModals 
        isUploadModalOpen={isUploadModalOpen}
        closeUploadModal={closeUploadModal}
        creatorId={creatorId}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        isFolderModalOpen={isFolderModalOpen}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        isEditNoteModalOpen={isEditNoteModalOpen}
        isCategoryModalOpen={isCategoryModalOpen}
        isDeleteFolderModalOpen={isDeleteFolderModalOpen}
        isDeleteCategoryModalOpen={isDeleteCategoryModalOpen}
        isRenameFolderModalOpen={isRenameFolderModalOpen}
        isRenameCategoryModalOpen={isRenameCategoryModalOpen}
        fileToEdit={fileToEdit}
        folderToDeleteId={folderToDeleteId}
        categoryToDeleteId={categoryToDeleteId}
        folderToRenameId={folderToRenameId}
        categoryToRenameId={categoryToRenameId}
        availableFolders={availableFolders}
        availableCategories={availableCategories}
        selectedFileIds={selectedFileIds}
        onCreateFolder={onCreateFolder}
        onCreateCategory={onCreateCategory}
        onAddFilesToFolder={onAddFilesToFolder}
        onEditNote={handleFileEdited}
        onDeleteFolder={onDeleteFolder}
        onDeleteCategory={onDeleteCategory}
        onRenameFolder={onRenameFolder}
        onRenameCategory={onRenameCategory}
        closeFolderModal={closeFolderModal}
        closeAddToFolderModal={closeAddToFolderModal}
        closeEditNoteModal={closeEditNoteModal}
        closeCategoryModal={closeCategoryModal}
        closeDeleteFolderModal={closeDeleteFolderModal}
        closeDeleteCategoryModal={closeDeleteCategoryModal}
        closeRenameFolderModal={closeRenameFolderModal}
        closeRenameCategoryModal={closeRenameCategoryModal}
      />

      {/* Add Tag Modal */}
      {availableTags && onTagCreate && (
        <AddTagModal
          isOpen={isTagModalOpen}
          onOpenChange={setIsTagModalOpen}
          selectedFileIds={selectedFileIds}
          availableTags={availableTags}
          onTagSelect={handleTagSelect}
          onTagCreate={onTagCreate}
        />
      )}
    </FileExplorerLayout>
  );
};
