
import React from 'react';
import { UploadCloud, RefreshCw, LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FilterBar } from '@/components/files/FilterBar';
import { FileGridContainer } from '@/components/files/grid/FileGridContainer';
import { FileExplorerSidebar } from '@/components/files/explorer/FileExplorerSidebar';
import { FileExplorerHeader } from '@/components/files/explorer/FileExplorerHeader';
import { CreatorFileType, Folder, Category, FileTag } from '@/types/fileTypes';

interface FileExplorerHeaderProps {
  creatorName: string;
  viewMode: 'list' | 'grid';
  setViewMode: (mode: 'list' | 'grid') => void;
  onUploadClick: () => void;
  onRefresh: () => void;
  selectedFileIds: string[];
  onAddToFolderClick: () => void;
  isCreatorView: boolean;
}

interface FileExplorerSidebarProps {
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string) => void;
  currentCategory: string;
  availableFolders: Folder[];
  availableCategories: Category[];
  onCreateFolder: () => void;
}

interface FileExplorerLayoutProps {
  filteredFiles: CreatorFileType[];
  viewMode: 'list' | 'grid';
  setViewMode: (viewMode: 'list' | 'grid') => void;
  onUploadClick: () => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string | null;
  setSelectedTypes: (type: string | null) => void;
  onFolderChange: (folderId: string) => void;
  selectedTags?: string[];
  setSelectedTags?: (tags: string[]) => void;
  availableTags?: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
  onEditNote?: (file: CreatorFileType) => void;
  onCreateFolder: () => void;
  onAddTag?: (file: CreatorFileType) => void;
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
  setSelectedTags = () => {},
  availableTags = [],
  onTagCreate,
  onEditNote,
  onCreateFolder,
  onAddTag
}) => {
  // Get these values from context
  const { 
    selectedFileIds = [], 
    handleAddToFolderClick,
    creatorName = 'Creator',
    currentFolder = 'all',
    currentCategory = '',
    availableFolders = [],
    availableCategories = [],
    onCategoryChange = () => {},
    isCreatorView = false
  } = React.useContext(React.createContext({} as any));

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter(id => id !== tagId)
        : [...selectedTags, tagId]
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <FileExplorerHeader
        creatorName={creatorName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onUploadClick={onUploadClick}
        onRefresh={onRefresh}
        selectedFileIds={selectedFileIds}
        onAddToFolderClick={handleAddToFolderClick}
        isCreatorView={isCreatorView}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <FileExplorerSidebar
          onFolderChange={onFolderChange}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onCreateFolder={onCreateFolder}
        />
        
        <div className="flex-1 overflow-auto p-4">
          <FilterBar
            activeFilter={selectedTypes}
            onFilterChange={setSelectedTypes}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagCreate={onTagCreate}
          />
          
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-1'} gap-4 mt-4`}>
            <FileGridContainer
              files={filteredFiles}
              isCreatorView={isCreatorView}
              onFilesChanged={onRefresh}
              recentlyUploadedIds={[]}
              onEditNote={onEditNote}
              onAddTag={onAddTag}
              currentFolder={currentFolder}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
