
import React from 'react';
import { FileExplorerHeader } from '../FileExplorerHeader';
import { FileExplorerSidebar } from '../FileExplorerSidebar';
import { FileExplorerContent } from '../FileExplorerContent';
import { useFileExplorerContext } from '../context/FileExplorerContext';
import { FileTag } from '@/hooks/useFileTags';
import { CreatorFileType } from '@/types/fileTypes';

interface FileExplorerLayoutProps {
  filteredFiles: CreatorFileType[];
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onUploadClick: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  onFolderChange: (folderId: string) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
  onEditNote: (file: CreatorFileType) => void;
  onCreateFolder: () => void;
  isCreatorView: boolean; // Added this prop
}

export const FileExplorerLayout: React.FC<FileExplorerLayoutProps> = ({
  filteredFiles,
  viewMode,
  setViewMode,
  onUploadClick,
  onRefresh,
  searchQuery,
  onSearchChange,
  selectedTypes,
  setSelectedTypes,
  onFolderChange,
  selectedTags = [],
  setSelectedTags,
  availableTags = [],
  onTagCreate,
  onEditNote,
  onCreateFolder,
  isCreatorView, // Added this prop
}) => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    onCategoryChange,
    availableFolders,
    availableCategories,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    handleAddToFolderClick,
    creatorName,
    isLoading
  } = useFileExplorerContext();

  return (
    <div className="flex flex-col h-full">
      <FileExplorerHeader
        creatorName={creatorName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={isCreatorView ? onUploadClick : undefined}
        onRefresh={onRefresh}
        selectedFileIds={selectedFileIds}
        onAddToFolderClick={
          selectedFileIds.length > 0 && isCreatorView
            ? handleAddToFolderClick
            : undefined
        }
        isCreatorView={isCreatorView} // Pass isCreatorView prop
      />
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar
          onFolderChange={onFolderChange}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onCreateFolder={isCreatorView ? onCreateFolder : undefined}
        />
        <FileExplorerContent
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          onTagCreate={onTagCreate}
          filteredFiles={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={(fileId) => {
            // TODO: Implement file deletion
            console.log(`Delete file ${fileId}`);
          }}
          recentlyUploadedIds={[]}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCreateFolder={isCreatorView ? onCreateFolder : undefined}
          availableFolders={availableFolders}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
        />
      </div>
    </div>
  );
};
