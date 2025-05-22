
import React from 'react';
import { Category, Folder, CreatorFileType } from '@/types/fileTypes';
import { CreateFolderModal, AddToFolderModal } from './modals/FolderModals';
import { AddTagModal } from './modals/TagModals';
import { FileTag } from '@/hooks/useFileTags';
import { useFileExplorer } from './useFileExplorer';

interface FileExplorerModalsProps {
  onRefresh: () => void;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  creatorId: string;
  currentFolder: string;
  currentCategory: string | null;
  fileExplorerState: ReturnType<typeof useFileExplorer>;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  onRefresh,
  onUploadComplete,
  onUploadStart,
  creatorId,
  currentFolder,
  currentCategory,
  fileExplorerState
}) => {
  const {
    selectedFileIds,
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
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleCreateNewFolder,
    availableFolders,
    availableCategories,
    isUploadModalOpen,
    setIsUploadModalOpen
  } = fileExplorerState;
  
  // For now we'll stub this until we implement tag functionality
  const singleFileForTagging = null;
  const availableTags: FileTag[] = [];
  const isAddTagModalOpen = false;
  const setIsAddTagModalOpen = () => {};
  const onTagSelect = () => {};
  const onTagCreate = undefined;
  const onTagRemove = undefined;
  
  return (
    <>
      {/* Add to folder modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        selectedFileIds={selectedFileIds}
        customFolders={availableFolders}
        categories={availableCategories}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        onCreateFolder={handleCreateNewFolder}
        onSubmit={handleAddToFolderSubmit}
      />
      
      {/* Add tag modal */}
      <AddTagModal
        isOpen={isAddTagModalOpen}
        onOpenChange={setIsAddTagModalOpen}
        selectedFileIds={singleFileForTagging ? [singleFileForTagging.id] : selectedFileIds}
        availableTags={availableTags}
        onTagSelect={onTagSelect}
        onTagCreate={onTagCreate}
        onTagRemove={onTagRemove}
        singleFileName={singleFileForTagging?.name}
        fileTags={singleFileForTagging?.tags}
      />
      
      {/* Create folder modal */}
      <CreateFolderModal
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        categories={availableCategories}
        selectedCategoryId={selectedCategoryForNewFolder}
        setSelectedCategoryId={setSelectedCategoryForNewFolder}
        onSubmit={handleCreateFolderSubmit}
      />
    </>
  );
};
