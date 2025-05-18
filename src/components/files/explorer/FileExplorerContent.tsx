
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FileList } from '../FileList';
import { FilterBar } from '../FilterBar';
import { CreatorFileType, FileTag } from '@/types/fileTypes';

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
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <p className="text-muted-foreground">No files found</p>
            {onCreateFolder && (
              <Button onClick={onCreateFolder}>Create Folder</Button>
            )}
          </div>
        ) : (
          <FileList
            files={filteredFiles}
            viewMode={viewMode}
            isCreatorView={isCreatorView}
            onFileDeleted={onFileDeleted}
            recentlyUploadedIds={recentlyUploadedIds}
            selectedFileIds={selectedFileIds}
            setSelectedFileIds={setSelectedFileIds}
            onAddToFolderClick={onAddToFolderClick}
            currentFolder={currentFolder}
            availableFolders={availableFolders}
            onRemoveFromFolder={onRemoveFromFolder}
            onEditNote={onEditNote}
            onAddTagClick={onAddTagClick}
          />
        )}
      </div>
    </div>
  );
};
