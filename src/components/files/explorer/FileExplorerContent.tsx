import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileList } from '../FileList';
import { FilterBar } from '../FilterBar';
import { CreatorFileType } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';
import { FileGridContainer } from '../grid/FileGridContainer';
import { EmptyState } from '../EmptyState';
import { EmptyFoldersState } from './EmptyFoldersState';
import { useFileExplorerContext } from './context/FileExplorerContext';

interface FileExplorerContentProps {
  isLoading: boolean;
  filteredFiles: CreatorFileType[];
  viewMode: 'grid' | 'list';
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted: (fileId: string) => void;
  recentlyUploadedIds: string[];
  selectedFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
  onAddToFolderClick: () => void;
  onAddTagClick?: () => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
  currentFolder: string;
  currentCategory: string | null;
  onCreateFolder?: () => void;
  availableFolders: Array<{ id: string; name: string; categoryId: string }>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote: (file: CreatorFileType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag>;
}

export const FileExplorerContent: React.FC<FileExplorerContentProps> = ({
  isLoading,
  filteredFiles,
  viewMode,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds,
  selectedFileIds,
  setSelectedFileIds,
  onAddToFolderClick,
  onAddTagClick,
  onAddTagToFile,
  currentFolder,
  currentCategory,
  onCreateFolder,
  availableFolders,
  onRemoveFromFolder,
  onEditNote,
  searchQuery,
  onSearchChange,
  selectedTypes,
  setSelectedTypes,
  selectedTags = [],
  setSelectedTags = () => {},
  availableTags = [],
  onTagCreate
}) => {
  const { availableFolders: availableFoldersContext, currentCategory: currentCategoryContext } = useFileExplorerContext();
  
  // Check if the current category has any folders
  const hasNoFolders = currentCategory && availableFoldersContext.filter(folder => 
    folder.categoryId === currentCategory && 
    folder.id !== 'all' && 
    folder.id !== 'unsorted'
  ).length === 0;
  
  return (
    <div className="flex-1 overflow-hidden">
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
          onSearchChange={onSearchChange}
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
        
        {selectedFileIds.length > 0 && isCreatorView && (
          <div className="flex items-center space-x-2 p-2 bg-muted/40 rounded-md">
            <span className="text-sm">{selectedFileIds.length} files selected</span>
            <Button size="sm" onClick={onAddToFolderClick}>
              Add to Folder
            </Button>
            {onAddTagClick && (
              <Button size="sm" variant="outline" onClick={onAddTagClick}>
                Add Tags
              </Button>
            )}
            {currentFolder !== 'all' && currentFolder !== 'unsorted' && onRemoveFromFolder && (
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => onRemoveFromFolder(selectedFileIds, currentFolder)}
              >
                Remove from Folder
              </Button>
            )}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading files...</p>
          </div>
        ) : hasNoFolders && currentCategory ? (
          <EmptyFoldersState onCreateFolder={onCreateFolder || (() => {})} />
        ) : filteredFiles.length === 0 ? (
          <EmptyState 
            isFiltered={searchQuery !== ''} 
            isCreatorView={isCreatorView}
            onUploadClick={onCreateFolder}
            currentFolder={currentFolder}
          />
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
                onEditNote={onEditNote}
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
              onEditNote={onEditNote}
              onAddTagClick={onAddTagClick}
              onAddTagToFile={onAddTagToFile}
              viewMode={viewMode}
            />
          )
        )}
      </div>
    </div>
  );
};
