
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FilterBar } from '../FilterBar';
import { FileGrid } from '../FileGrid';
import { FileList } from '../FileList';
import { FileViewSkeleton } from '../FileViewSkeleton';

interface FileExplorerContentProps {
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  filteredFiles: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted: (fileId: string) => void;
  recentlyUploadedIds: string[];
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  onAddToFolderClick: () => void;
  currentFolder: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
}

export const FileExplorerContent: React.FC<FileExplorerContentProps> = ({
  isLoading,
  viewMode,
  searchQuery,
  onSearchChange,
  selectedTypes,
  setSelectedTypes,
  filteredFiles,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds,
  selectedFileIds,
  setSelectedFileIds,
  onAddToFolderClick,
  currentFolder,
  onRemoveFromFolder,
  onEditNote
}) => {
  return (
    <div className="flex-1 min-w-0">
      <FilterBar 
        activeFilter={selectedTypes.length > 0 ? selectedTypes[0] : null}
        onFilterChange={(filter) => {
          setSelectedTypes(filter ? [filter] : []);
        }}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      
      {isLoading ? (
        <FileViewSkeleton view={viewMode} />
      ) : viewMode === 'grid' ? (
        <FileGrid 
          files={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onFilesChanged}
          onFileDeleted={onFileDeleted}
          recentlyUploadedIds={recentlyUploadedIds}
          onSelectFiles={setSelectedFileIds}
          onAddToFolderClick={onAddToFolderClick}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
        />
      ) : (
        <FileList 
          files={filteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onFilesChanged}
          onFileDeleted={onFileDeleted}
          recentlyUploadedIds={recentlyUploadedIds}
          onSelectFiles={setSelectedFileIds}
          onAddToFolderClick={onAddToFolderClick}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
        />
      )}
    </div>
  );
};
