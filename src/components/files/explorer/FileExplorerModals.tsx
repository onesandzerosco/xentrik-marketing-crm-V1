
import React from 'react';
import { FileUploadModal } from './FileUploadModal';
import { AddToFolderModal } from './AddToFolderModal';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { EditNoteModal } from './EditNoteModal';
import { AddTagModal } from './modals/TagModals';

interface FileExplorerModalsProps {
  onRefresh: () => void;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  creatorId: string;
  currentFolder: string;
  currentCategory: string | null;
  fileExplorerState: {
    isUploadModalOpen: boolean;
    setIsUploadModalOpen: (isOpen: boolean) => void;
    isAddToFolderModalOpen: boolean;
    setIsAddToFolderModalOpen: (isOpen: boolean) => void;
    isCreateFolderModalOpen: boolean;
    setIsCreateFolderModalOpen: (isOpen: boolean) => void;
    isAddCategoryModalOpen: boolean;
    setIsAddCategoryModalOpen: (isOpen: boolean) => void;
    isDeleteFolderModalOpen: boolean;
    setIsDeleteFolderModalOpen: (isOpen: boolean) => void;
    isDeleteCategoryModalOpen: boolean;
    setIsDeleteCategoryModalOpen: (isOpen: boolean) => void;
    isFileNoteModalOpen: boolean;
    setIsFileNoteModalOpen: (isOpen: boolean) => void;
    fileToEdit: any;
    setFileToEdit: (file: any) => void;
    selectedFileIds: string[];
    // Tag related props
    isAddTagModalOpen?: boolean;
    setIsAddTagModalOpen?: (isOpen: boolean) => void;
    availableTags?: any[];
    onAddTagToFiles?: (tagName: string) => Promise<void>;
    onRemoveTagFromFiles?: (tagName: string) => Promise<void>;
    onTagCreate?: (name: string) => Promise<any>;
  };
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
  return (
    <>
      <FileUploadModal
        isOpen={fileExplorerState.isUploadModalOpen}
        onOpenChange={fileExplorerState.setIsUploadModalOpen}
        onRefresh={onRefresh}
        creatorId={creatorId}
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        onUploadComplete={onUploadComplete}
        onUploadStart={onUploadStart}
      />
      
      <AddToFolderModal
        isOpen={fileExplorerState.isAddToFolderModalOpen}
        onOpenChange={fileExplorerState.setIsAddToFolderModalOpen}
        selectedFileIds={fileExplorerState.selectedFileIds}
        onRefresh={onRefresh}
        currentCategory={currentCategory}
      />
      
      <CreateFolderModal
        isOpen={fileExplorerState.isCreateFolderModalOpen}
        onOpenChange={fileExplorerState.setIsCreateFolderModalOpen}
        selectedFileIds={fileExplorerState.selectedFileIds}
        onRefresh={onRefresh}
        currentCategory={currentCategory}
      />
      
      <CreateCategoryModal
        isOpen={fileExplorerState.isAddCategoryModalOpen}
        onOpenChange={fileExplorerState.setIsAddCategoryModalOpen}
        onRefresh={onRefresh}
      />
      
      <DeleteFolderModal
        isOpen={fileExplorerState.isDeleteFolderModalOpen}
        onOpenChange={fileExplorerState.setIsDeleteFolderModalOpen}
        onRefresh={onRefresh}
      />
      
      <DeleteCategoryModal
        isOpen={fileExplorerState.isDeleteCategoryModalOpen}
        onOpenChange={fileExplorerState.setIsDeleteCategoryModalOpen}
        onRefresh={onRefresh}
      />
      
      <EditNoteModal
        isOpen={fileExplorerState.isFileNoteModalOpen}
        onOpenChange={fileExplorerState.setIsFileNoteModalOpen}
        file={fileExplorerState.fileToEdit}
        onRefresh={onRefresh}
      />
      
      {/* Add Tag Modal */}
      {fileExplorerState.isAddTagModalOpen !== undefined && fileExplorerState.setIsAddTagModalOpen && (
        <AddTagModal
          isOpen={fileExplorerState.isAddTagModalOpen}
          onOpenChange={fileExplorerState.setIsAddTagModalOpen}
          selectedFileIds={fileExplorerState.selectedFileIds}
          availableTags={fileExplorerState.availableTags || []}
          onTagSelect={fileExplorerState.onAddTagToFiles || (() => Promise.resolve())}
          onTagRemove={fileExplorerState.onRemoveTagFromFiles}
          onTagCreate={fileExplorerState.onTagCreate}
          singleFileName={fileExplorerState.fileToEdit?.name}
          fileTags={fileExplorerState.fileToEdit?.tags || []}
        />
      )}
    </>
  );
};
