
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { FileList } from '../FileList';
import { FilterBar } from '../FilterBar';
import { CreatorFileType } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';
import { FileGridContainer } from '../grid/FileGridContainer';
import { BatchActionsBar } from './BatchActionsBar';

interface FileExplorerContentProps {
  isLoading: boolean;
  filteredFiles: CreatorFileType[];
  viewMode: 'grid' | 'list';
  isCreatorView: boolean;
  onFilesChanged?: () => void;
  onFileDeleted: (fileId: string) => void;
  recentlyUploadedIds?: string[];
  selectedFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
  onAddToFolderClick?: () => void;
  onAddTagClick?: () => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
  currentFolder?: string;
  currentCategory?: string | null;
  onCreateFolder?: () => void;
  onUploadClick?: () => void;
  availableFolders?: Array<{ id: string; name: string; categoryId: string }>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedTypes?: string[];
  setSelectedTypes?: (types: string[]) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag>;
  handleEditNote: (file: CreatorFileType) => void;
}

export const FileExplorerContent: React.FC<FileExplorerContentProps> = ({
  isLoading,
  filteredFiles,
  viewMode,
  isCreatorView,
  onFilesChanged = () => {},
  onFileDeleted,
  recentlyUploadedIds = [],
  selectedFileIds,
  setSelectedFileIds,
  onAddToFolderClick = () => {},
  onAddTagClick,
  onAddTagToFile,
  currentFolder = 'all',
  currentCategory,
  onCreateFolder,
  onUploadClick,
  availableFolders = [],
  onRemoveFromFolder,
  onEditNote,
  searchQuery = '',
  onSearchChange,
  selectedTypes = [],
  setSelectedTypes = () => {},
  selectedTags = [],
  setSelectedTags = () => {},
  availableTags = [],
  onTagCreate,
  handleEditNote
}) => {
  // Handle search change with fallback to setSearchQuery if onSearchChange not provided
  const handleSearchChange = (query: string) => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  };

  const clearSelection = () => {
    setSelectedFileIds([]);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <FilterBar
            activeFilter={selectedTypes.length > 0 ? selectedTypes[0] : null}
            onFilterChange={(filter) => {
              if (filter) {
                setSelectedTypes([filter]);
              } else {
                setSelectedTypes([]);
              }
            }}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={(tagId) => {
              if (selectedTags.includes(tagId)) {
                setSelectedTags(selectedTags.filter(id => id !== tagId));
              } else {
                setSelectedTags([...selectedTags, tagId]);
              }
            }}
            onTagCreate={onTagCreate}
          />
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <p className="text-muted-foreground">No files found</p>
              {currentFolder !== 'all' && currentFolder !== 'unsorted' ? (
                <div className="flex flex-col items-center">
                  <p className="text-sm text-muted-foreground">This folder is empty</p>
                  {isCreatorView && onUploadClick && (
                    <Button onClick={onUploadClick} className="mt-2">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload files
                    </Button>
                  )}
                </div>
              ) : onCreateFolder && (
                <Button onClick={onCreateFolder}>Create Folder</Button>
              )}
            </div>
          ) : (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <FileGridContainer 
                  files={filteredFiles}
                  isCreatorView={isCreatorView}
                  onFilesChanged={onFilesChanged}
                  onFileDeleted={onFileDeleted}
                  recentlyUploadedIds={recentlyUploadedIds}
                  onSelectFiles={setSelectedFileIds}
                  onEditNote={onEditNote || handleEditNote}
                  onAddTagToFile={onAddTagToFile}
                  currentFolder={currentFolder}
                  onRemoveFromFolder={onRemoveFromFolder}
                />
              </div>
            ) : (
              <FileList
                files={filteredFiles}
                isCreatorView={isCreatorView}
                onFileDeleted={onFileDeleted}
                recentlyUploadedIds={recentlyUploadedIds}
                onSelectFiles={setSelectedFileIds} 
                onAddToFolderClick={onAddToFolderClick}
                currentFolder={currentFolder}
                availableFolders={availableFolders}
                onRemoveFromFolder={onRemoveFromFolder}
                onEditNote={onEditNote || handleEditNote}
                onAddTagClick={onAddTagClick}
                onAddTagToFile={onAddTagToFile}
                viewMode={viewMode}
              />
            )
          )}
        </div>
      </div>

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedFileIds={selectedFileIds}
        files={filteredFiles}
        onFilesChanged={onFilesChanged}
        onFileDeleted={onFileDeleted}
        onClearSelection={clearSelection}
        isCreatorView={isCreatorView}
        onAddToFolderClick={onAddToFolderClick}
        onAddTagClick={onAddTagClick}
        currentFolder={currentFolder}
        onRemoveFromFolder={onRemoveFromFolder}
      />
    </>
  );
};
