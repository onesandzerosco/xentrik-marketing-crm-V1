
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileExplorerHeader } from '../FileExplorerHeader';
import { FileExplorerSidebar } from '../FileExplorerSidebar';
import { FileExplorerContent } from '../FileExplorerContent';
import { useFileExplorerContext } from '../context/FileExplorerContext';

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
  onEditNote: (file: CreatorFileType) => void;
  onCreateFolder: () => void;
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
  onEditNote,
  onCreateFolder,
}) => {
  const {
    creatorName,
    isCreatorView,
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    handleAddToFolderClick,
    availableFolders,
    availableCategories,
    onRemoveFromFolder,
    isLoading,
    onCategoryChange
  } = useFileExplorerContext();

  return (
    <>
      <FileExplorerHeader 
        creatorName={creatorName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={onUploadClick}
        isCreatorView={isCreatorView}
        onRefresh={onRefresh}
        selectedFileIds={selectedFileIds}
        onAddToFolderClick={handleAddToFolderClick}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar 
          onFolderChange={onFolderChange}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCategoryChange={onCategoryChange}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          isCreatorView={isCreatorView}
        />
        
        <FileExplorerContent 
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          filteredFiles={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={onRefresh}
          recentlyUploadedIds={[]}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCreateFolder={onCreateFolder}
          availableFolders={availableFolders}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
        />
      </div>
    </>
  );
};
