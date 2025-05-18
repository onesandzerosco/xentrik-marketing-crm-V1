
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileFilters } from './explorer/hooks/useFileFilters';
import { TagDialog } from './explorer/dialogs/TagDialog';
import { NoteDialog } from './explorer/dialogs/NoteDialog';
import { useFileDelete } from './explorer/hooks/useFileDelete';
import { useFileTags } from './explorer/hooks/useFileTags';
import { useFileNotesDialog } from './explorer/hooks/useFileNotesDialog';
import { useFileUpload } from './explorer/hooks/useFileUpload';
import { FileTag } from '@/hooks/useFileTags';

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
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
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
  selectedTags = [],
  setSelectedTags = () => {},
  availableTags = [],
  onTagCreate
}) => {
  const queryClient = useQueryClient();
  
  // State for file selection
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);

  // Use custom hooks
  const { handleFileDeleted } = useFileDelete(creatorId, onRefresh);
  
  const {
    showTagDialog,
    setShowTagDialog,
    fileToTag,
    selectedFileTag,
    handleAddTag,
    handleSaveTag,
    handleTagSelect
  } = useFileTags(creatorId, onRefresh);
  
  const {
    showEditNoteModal,
    setShowEditNoteModal,
    fileToEdit,
    editedNote,
    setEditedNote,
    handleEditNote,
    handleUpdateNote
  } = useFileNotesDialog(creatorId, onRefresh);
  
  // File filtering and view mode
  const {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles
  } = useFileFilters({ 
    files,
    selectedTags
  });

  // File upload handlers
  const { onDrop } = useFileUpload(
    creatorId,
    currentFolder,
    currentCategory,
    onUploadStart,
    onUploadComplete
  );
  
  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    disabled: !isCreatorView,
  });
  
  const handleCreateFolderClick = () => {
    setShowUploadModal(true);
  };
  
  const handleAddToFolderClick = () => {
    setShowAddToFolderModal(true);
  };
  
  // Additional handlers for context
  const handleInitiateNewCategory = () => {
    console.log("Initialize new category");
  };
  
  const handleInitiateNewFolder = (categoryId?: string) => {
    console.log("Initialize new folder in category", categoryId);
  };
  
  const handleDeleteCategoryClick = (categoryId: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(categoryId);
    }
  };
  
  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    console.log("Rename category", categoryId, currentName);
  };
  
  const handleDeleteFolderClick = (folderId: string) => {
    if (onDeleteFolder) {
      onDeleteFolder(folderId);
    }
  };
  
  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    console.log("Rename folder", folderId, currentName);
  };

  const contextValue = {
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    handleAddToFolderClick: () => setShowAddToFolderModal(true),
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    handleDeleteCategoryClick,
    handleRenameCategoryClick,
    handleDeleteFolderClick,
    handleRenameFolderClick,
    creatorName,
    creatorId,
    isCreatorView,
    availableFolders,
    availableCategories,
    onCategoryChange,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    viewMode,
    isLoading
  };
  
  return (
    <div className="flex flex-col h-full w-full">
      <FileExplorerProvider value={contextValue}>
        <FileExplorerLayout
          filteredFiles={filteredFiles}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={open}
          onRefresh={onRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes[0] || null}
          setSelectedTypes={(type) => setSelectedTypes(type ? [type] : [])}
          onFolderChange={onFolderChange}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          onTagCreate={onTagCreate}
          onEditNote={handleEditNote}
          onCreateFolder={handleCreateFolderClick}
          onAddTag={handleAddTag}
        />
        
        {/* Hidden Dropzone for file uploads */}
        <div {...getRootProps()} className="hidden">
          <input {...getInputProps()} />
        </div>
      </FileExplorerProvider>
      
      {/* Tag Dialog */}
      <TagDialog
        showTagDialog={showTagDialog}
        setShowTagDialog={setShowTagDialog}
        fileToTag={fileToTag}
        selectedFileTag={selectedFileTag}
        handleTagSelect={handleTagSelect}
        handleSaveTag={handleSaveTag}
        availableTags={availableTags}
        onTagCreate={onTagCreate}
      />
      
      {/* Note Dialog */}
      <NoteDialog
        showEditNoteModal={showEditNoteModal}
        setShowEditNoteModal={setShowEditNoteModal}
        fileToEdit={fileToEdit}
        editedNote={editedNote}
        setEditedNote={setEditedNote}
        handleUpdateNote={handleUpdateNote}
      />
    </div>
  );
};
