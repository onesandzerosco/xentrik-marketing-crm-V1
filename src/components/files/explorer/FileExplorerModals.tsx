
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileUploadModal } from './FileUploadModal';
import { CreateFolderModal } from './CreateFolderModal';
import { AddToFolderModal } from './AddToFolderModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { EditNoteModal } from './EditNoteModal';

interface Folder {
  id: string;
  name: string;
}

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
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedFileIds: string[];
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  customFolders: Folder[];
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  onUploadComplete?: (fileIds?: string[]) => void;
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: () => void;
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
  creatorId,
  creatorName,
  currentFolder,
  newFolderName,
  setNewFolderName,
  selectedFileIds,
  targetFolderId,
  setTargetFolderId,
  customFolders,
  editingFile,
  editingNote,
  setEditingNote,
  onUploadComplete,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleSaveNote
}) => {
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
