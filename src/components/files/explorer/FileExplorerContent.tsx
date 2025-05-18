
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FilterBar } from '../FilterBar';
import { FileGrid } from '../FileGrid';
import { FileList } from '../FileList';
import { FileViewSkeleton } from '../FileViewSkeleton';
import { EmptyState } from '../EmptyState';
import { EmptyFoldersState } from './EmptyFoldersState';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerContentProps {
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
  filteredFiles: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted: (fileId: string) => void;
  recentlyUploadedIds: string[];
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  onAddToFolderClick: () => void;
  currentFolder: string;
  currentCategory: string | null;
  onCreateFolder?: () => void;
  availableFolders: { id: string; name: string; categoryId: string }[];
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
  selectedTags = [],
  setSelectedTags,
  availableTags = [],
  onTagCreate,
  filteredFiles,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds,
  selectedFileIds,
  setSelectedFileIds,
  onAddToFolderClick,
  currentFolder,
  currentCategory,
  onCreateFolder,
  availableFolders,
  onRemoveFromFolder,
  onEditNote
}) => {
  // Check if we're viewing a category and there are no folders in it
  const isViewingEmptyCategory = () => {
    if (!currentCategory || currentCategory === 'all') return false;
    
    // Count folders that belong to this category
    const foldersInCategory = availableFolders.filter(
      folder => folder.categoryId === currentCategory && 
      folder.id !== 'all' && 
      folder.id !== 'unsorted'
    );
    
    return foldersInCategory.length === 0;
  };

  const handleTagSelect = (tagId: string) => {
    if (setSelectedTags) {
      // Create a new array to update the state
      if (selectedTags.includes(tagId)) {
        setSelectedTags(selectedTags.filter(id => id !== tagId));
      } else {
        setSelectedTags([...selectedTags, tagId]);
      }
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <FilterBar 
        activeFilter={selectedTypes.length > 0 ? selectedTypes[0] : null}
        onFilterChange={(filter) => {
          setSelectedTypes(filter ? [filter] : []);
        }}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onTagCreate={onTagCreate}
      />
      
      {isLoading ? (
        <FileViewSkeleton view={viewMode} />
      ) : isViewingEmptyCategory() && onCreateFolder ? (
        <EmptyFoldersState onCreateFolder={onCreateFolder} />
      ) : filteredFiles.length === 0 ? (
        <EmptyState 
          isFiltered={searchQuery !== '' || selectedTypes.length > 0 || selectedTags.length > 0}
          isCreatorView={isCreatorView}
          onUploadClick={() => {}} // We'll handle uploads elsewhere
          currentFolder={currentFolder}
        />
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
