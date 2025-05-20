
import React from 'react';
import { FileExplorerModals } from '../FileExplorerModals';
import { AddTagModalWrapper } from './AddTagModalWrapper';
import { NoteEditingModal } from './NoteEditingModal';
import { Category, Folder, CreatorFileType } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerModalsWrapperProps {
  // File selection
  selectedFileIds: string[];
  
  // Folders and categories
  availableFolders: Folder[];
  availableCategories: Category[];
  
  // Tags
  availableTags: FileTag[];
  addTagToFiles: (fileIds: string[], tagId: string) => Promise<void>;
  
  // Modal states and handlers - Folder modals
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (isOpen: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (folderId: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (categoryId: string) => void;
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
  
  // Tag modal
  isAddTagModalOpen: boolean;
  setIsAddTagModalOpen: (isOpen: boolean) => void;
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  singleFileForTagging: CreatorFileType | null;
  
  // Note editing modal
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (isOpen: boolean) => void;
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  handleSaveNote: () => void;
}

export const FileExplorerModalsWrapper: React.FC<FileExplorerModalsWrapperProps> = ({
  // File selection
  selectedFileIds,
  
  // Folders and categories
  availableFolders,
  availableCategories,
  
  // Tags
  availableTags,
  addTagToFiles,
  
  // Modal states and handlers - Folder modals
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
  onAddFilesToFolder,
  handleCreateNewFolder,
  
  // Tag modal
  isAddTagModalOpen,
  setIsAddTagModalOpen,
  onTagSelect,
  onTagCreate,
  singleFileForTagging,
  
  // Note editing modal
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  editingFile,
  editingNote,
  setEditingNote,
  handleSaveNote
}) => {
  return (
    <>
      {/* Standard explorer modals */}
      <FileExplorerModals 
        selectedFileIds={selectedFileIds}
        customFolders={availableFolders}
        categories={availableCategories}
        availableTags={availableTags}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        isAddTagModalOpen={isAddTagModalOpen}
        setIsAddTagModalOpen={setIsAddTagModalOpen}
        onTagSelect={onTagSelect}
        onTagCreate={onTagCreate}
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
        singleFileForTagging={singleFileForTagging}
      />
      
      {/* Advanced tag modal wrapper with direct access to addTagToFiles */}
      <AddTagModalWrapper
        isOpen={isAddTagModalOpen}
        onOpenChange={setIsAddTagModalOpen}
        selectedFileIds={selectedFileIds}
        availableTags={availableTags}
        onTagSelect={onTagSelect}
        onTagCreate={onTagCreate}
        singleFile={singleFileForTagging}
        addTagToFiles={addTagToFiles}
      />
      
      {/* Note editing modal */}
      <NoteEditingModal
        isOpen={isEditNoteModalOpen}
        setIsOpen={setIsEditNoteModalOpen}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onSave={handleSaveNote}
      />
    </>
  );
};
