
import React from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { FileHeader } from './FileHeader';
import { FolderNav } from './FolderNav';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileUploadModal } from './explorer/FileUploadModal';
import { CreateFolderModal } from './explorer/CreateFolderModal';
import { AddToFolderModal } from './explorer/AddToFolderModal';
import { DeleteFolderModal } from './explorer/DeleteFolderModal';
import { EditNoteModal } from './explorer/EditNoteModal';
import { FileExplorerContent } from './explorer/FileExplorerContent';
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
  onRemoveFromFolder
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
    handleFileDeleted
  } = useFileExplorer({
    files,
    availableFolders,
    currentFolder,
    onRefresh,
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onRemoveFromFolder
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
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={() => setIsUploadModalOpen(true)}
        isCreatorView={isCreatorView}
      />
      
      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0 mt-1">
          <FolderNav 
            folders={availableFolders}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            onInitiateNewFolder={() => {
              if (selectedFileIds.length > 0) {
                setIsAddFolderModalOpen(true);
              } else {
                toast({
                  title: "Select files first",
                  description: "Please select at least one file to add to a new folder",
                });
              }
            }}
            onDeleteFolder={handleDeleteFolderClick}
          />
        </div>
        
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
    </div>
  );
};
