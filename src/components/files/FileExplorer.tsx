
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useToast } from "@/components/ui/use-toast";

interface Folder {
  id: string;
  name: string;
}

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  availableFolders: Folder[];
  isCreatorView: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[]) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  availableFolders,
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRemoveFromFolder,
  onRenameFolder
}) => {
  const permissions = useFilePermissions();
  const { toast } = useToast();
  
  const {
    viewMode,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    selectedFileIds,
    setSelectedFileIds,
    newFolderName,
    setNewFolderName,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    filteredFiles,
    customFolders,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolderClick,
    handleDeleteFolder,
    handleEditNote,
    handleSaveNote,
    handleFileDeleted,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderCurrentName,
    handleRenameFolderClick,
    handleRenameFolder
  } = useFileExplorer({
    files,
    availableFolders,
    currentFolder,
    onRefresh,
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onRemoveFromFolder,
    onRenameFolder
  });

  // Helper function to handle "Add to Folder" button click
  const handleAddToFolderButtonClick = () => {
    if (selectedFileIds.length > 0 && customFolders.length > 0) {
      setIsAddToFolderModalOpen(true);
    } else if (selectedFileIds.length === 0) {
      toast({
        title: "Select files first",
        description: "Please select at least one file to add to a folder",
      });
    } else {
      toast({
        title: "No custom folders",
        description: "Please create a folder first",
      });
      setIsAddFolderModalOpen(true);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      <FileExplorerHeader 
        creatorName={creatorName}
        onUploadClick={() => setIsUploadModalOpen(true)}
        isCreatorView={isCreatorView}
      />
      
      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <FileExplorerSidebar 
          folders={availableFolders}
          currentFolder={currentFolder}
          onFolderChange={onFolderChange}
          onInitiateNewFolder={() => setIsAddFolderModalOpen(true)}
          onDeleteFolder={handleDeleteFolderClick}
          onRenameFolder={handleRenameFolderClick}
          selectedFileIds={selectedFileIds}
        />
        
        <FileExplorerContent
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          filteredFiles={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={handleFileDeleted}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderButtonClick}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={handleEditNote}
        />
      </div>
      
      <FileExplorerModals
        isUploadModalOpen={isUploadModalOpen}
        setIsUploadModalOpen={setIsUploadModalOpen}
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        isDeleteFolderModalOpen={isDeleteFolderModalOpen}
        setIsDeleteFolderModalOpen={setIsDeleteFolderModalOpen}
        isEditNoteModalOpen={isEditNoteModalOpen}
        setIsEditNoteModalOpen={setIsEditNoteModalOpen}
        isRenameFolderModalOpen={isRenameFolderModalOpen}
        setIsRenameFolderModalOpen={setIsRenameFolderModalOpen}
        folderCurrentName={folderCurrentName}
        creatorId={creatorId}
        creatorName={creatorName}
        currentFolder={currentFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedFileIds={selectedFileIds}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        customFolders={customFolders}
        editingFile={editingFile}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onUploadComplete={onUploadComplete}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        handleDeleteFolder={handleDeleteFolder}
        handleRenameFolder={handleRenameFolder}
        handleSaveNote={handleSaveNote}
      />
    </div>
  );
};
