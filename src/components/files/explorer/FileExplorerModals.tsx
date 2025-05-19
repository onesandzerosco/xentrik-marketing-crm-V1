
import React from 'react';
import { Category, Folder } from '@/types/fileTypes';
import { AddToFolderModal } from './modals/FolderModals';
import { AddTagModal } from './modals/TagModals';
import { CreateFolderModal } from './modals/FolderModals';
import { FileTag } from '@/hooks/useFileTags';
import { CreatorFileType } from '@/types/fileTypes';

interface FileExplorerModalsProps {
  selectedFileIds: string[];
  customFolders: Folder[];
  categories: Category[];
  availableTags: FileTag[];
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (isOpen: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (folderId: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (categoryId: string) => void;
  isAddTagModalOpen: boolean;
  setIsAddTagModalOpen: (isOpen: boolean) => void;
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (isOpen: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  setSelectedCategoryForNewFolder: (categoryId: string) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId: string) => Promise<void>;
  handleCreateNewFolder: () => void;
  singleFileForTagging: CreatorFileType | null;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  selectedFileIds,
  customFolders,
  categories,
  availableTags,
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  isAddTagModalOpen,
  setIsAddTagModalOpen,
  onTagSelect,
  onTagCreate,
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  setSelectedCategoryForNewFolder,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  onAddFilesToFolder,
  handleCreateNewFolder,
  singleFileForTagging
}) => {
  // Calculate effective file count for the tag modal
  const effectiveFileCount = singleFileForTagging ? 1 : selectedFileIds.length;
  
  return (
    <>
      {/* Add to folder modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        categories={categories}
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
        singleFileName={singleFileForTagging?.name}
      />
      
      {/* Create folder modal */}
      <CreateFolderModal
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        categories={categories}
        selectedCategoryId={selectedCategoryForNewFolder}
        setSelectedCategoryId={setSelectedCategoryForNewFolder}
        onSubmit={handleCreateFolderSubmit}
      />
    </>
  );
};
