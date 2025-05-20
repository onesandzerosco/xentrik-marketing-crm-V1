
import React, { useState, useEffect } from 'react';
import { FileExplorerView } from './FileExplorerView';
import { FilterBar } from '../FilterBar';
import { CreatorFileType } from '@/types/fileTypes';
import { useFileExplorerContext } from './context/FileExplorerContext';
import { UploadButton } from '../UploadButton';
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from 'lucide-react';

export const FileExplorerContent: React.FC = () => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    filteredFiles,
    onAddTagClick,
    onAddTagToFile,
    availableTags,
    selectedTags,
    setSelectedTags,
    onTagSelect,
    onTagRemove,
    onTagCreate,
    creatorName,
    creatorId,
    isCreatorView,
    onFileDeleted,
    viewMode,
    setViewMode,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isUploadModalOpen,
    setIsUploadModalOpen,
    onUploadComplete,
    onUploadStart,
    onRefresh,
    onFolderChange,
    onCategoryChange,
    onCreateCategory,
    onRenameFolder,
    onRenameCategory
  } = useFileExplorerContext();
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {creatorName ? `${creatorName}'s Files` : 'Shared Files'}
        </h2>
        
        <UploadButton 
          creatorId={creatorId}
          onUploadComplete={onUploadComplete}
          onUploadStart={onUploadStart}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
        />
      </div>
      
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        availableTags={availableTags}
        selectedTags={selectedTags}
        onTagSelect={onTagSelect}
        onTagCreate={onTagCreate}
      />
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-40 w-full rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 && searchQuery ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No files found.</AlertTitle>
          <AlertDescription>
            No files matched your search query. Please try a different search.
          </AlertDescription>
        </Alert>
      ) : (
        <FileExplorerView
          files={filteredFiles}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onFileDeleted={onFileDeleted}
          onAddTagToFile={onAddTagToFile}
        />
      )}
    </div>
  );
};
