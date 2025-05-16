import React from 'react';
import { CreatorFileType, Folder } from '@/types/fileTypes';
import { FileUploadModal } from './FileUploadModal';
import { CreateFolderModal } from './CreateFolderModal';
import { AddToFolderModal } from './AddToFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { EditNoteModal } from './EditNoteModal';
import { RenameFolderModal } from './RenameFolderModal';

interface FileExplorerModalsProps {
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  // Nested folder modals
  isCategoryModalOpen?: boolean;
  setIsCategoryModalOpen?: (open: boolean) => void;
  isSubfolderModalOpen?: boolean;
  setIsSubfolderModalOpen?: (open: boolean) => void;
  isCategory?: boolean;
  setIsCategory?: (isCategory: boolean) => void;
  parentFolderId?: string | null;
  setParentFolderId?: (parentId: string | null) => void;
  categories?: Folder[];
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  folderCurrentName: string;
  selectedFileIds: string[];
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  customFolders: Folder[];
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  onUploadComplete?: (fileIds?: string[]) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleCreateFolderWithParams?: (folderName: string, fileIds: string[], isCategory: boolean, parentId: string | null) => Promise<void>;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: () => void;
  handleRenameFolder: (e: React.FormEvent) => void;
  handleSaveNote: () => void;
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  // Nested folder props
  isCategoryModalOpen = false,
  setIsCategoryModalOpen = () => {},
  isSubfolderModalOpen = false,
  setIsSubfolderModalOpen = () => {},
  isCategory = false,
  setIsCategory = () => {},
  parentFolderId = null,
  setParentFolderId = () => {},
  categories = [],
  // Other standard props
  creatorId,
  creatorName,
  currentFolder,
  newFolderName,
  setNewFolderName,
  folderCurrentName,
  selectedFileIds,
  targetFolderId,
  setTargetFolderId,
  customFolders,
  editingFile,
  editingNote,
  setEditingNote,
  onUploadComplete,
  handleCreateFolderSubmit,
  handleCreateFolderWithParams,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  handleSaveNote
}) => {
  // Helper function for category creation
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleCreateFolderWithParams && newFolderName) {
      handleCreateFolderWithParams(newFolderName, selectedFileIds, true, null)
        .then(() => {
          setIsCategoryModalOpen(false);
          setNewFolderName('');
        })
        .catch(err => console.error("Error creating category:", err));
    }
  };

  // Helper function for subfolder creation
  const handleCreateSubfolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handleCreateFolderWithParams && newFolderName && parentFolderId) {
      handleCreateFolderWithParams(newFolderName, selectedFileIds, false, parentFolderId)
        .then(() => {
          setIsSubfolderModalOpen(false);
          setNewFolderName('');
        })
        .catch(err => console.error("Error creating subfolder:", err));
    }
  };

  return (
    <>
      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        creatorId={creatorId}
        creatorName={creatorName}
        onUploadComplete={(fileIds) => {
          onUploadComplete?.(fileIds);
        }}
        currentFolder={currentFolder}
      />
      
      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFileIds={selectedFileIds}
        onSubmit={handleCreateFolderSubmit}
        title="Create New Folder"
      />
      
      {/* Create Category Modal */}
      <CreateFolderModal
        isOpen={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFileIds={selectedFileIds}
        onSubmit={handleCreateCategorySubmit}
        title="Create New Category"
        isCategory={true}
      />
      
      {/* Create Subfolder Modal */}
      <CreateFolderModal
        isOpen={isSubfolderModalOpen}
        onOpenChange={setIsSubfolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFileIds={selectedFileIds}
        onSubmit={handleCreateSubfolderSubmit}
        parentId={parentFolderId}
        setParentId={setParentFolderId}
        categories={categories}
        title="Create New Subfolder"
      />
      
      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        onSubmit={handleAddToFolderSubmit}
      />
      
      {/* Delete Folder Confirmation Modal */}
      <DeleteFolderModal
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={setIsDeleteFolderModalOpen}
        onConfirm={handleDeleteFolder}
      />
      
      {/* Rename Folder Modal */}
      <RenameFolderModal
        isOpen={isRenameFolderModalOpen}
        onOpenChange={setIsRenameFolderModalOpen}
        folderCurrentName={folderCurrentName}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onSubmit={handleRenameFolder}
      />
      
      {/* Edit Note Modal */}
      <EditNoteModal
        isOpen={isEditNoteModalOpen}
        onOpenChange={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onSave={handleSaveNote}
      />
    </>
  );
};
