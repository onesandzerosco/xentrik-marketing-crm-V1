
import React from 'react';
import { GridView } from './GridView';
import { ListView } from './ListView';
import { Skeleton } from "@/components/ui/skeleton";
import { useFileExplorerContext } from './context/FileExplorerContext';
import { UploadArea } from './UploadArea';
import { Empty } from '@/components/ui/empty';

export const FileExplorerContent = () => {
  const {
    filteredFiles,
    selectedFileIds,
    setSelectedFileIds,
    viewMode,
    isLoading,
    availableTags,
    isCreatorView,
    onFileDeleted,
    onAddTagToFile,
    onUploadClick,
    currentFolder,
    currentCategory,
    onCreateFolder,
    onRefresh,
    onRemoveFromFolder,
    onEditNote,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    selectedTags,
    setSelectedTags,
    availableTags: allAvailableTags,
    onTagCreate,
    onTagSelect,
    onSearchChange
  } = useFileExplorerContext();
  
  const handleFileClick = (fileId: string) => {
    setSelectedFileIds(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map(file => file.id));
    }
  };
  
  // Helper function to convert tagId to tagName
  const getTagNameById = (tagId: string): string => {
    const tag = allAvailableTags.find(t => t.id === tagId);
    return tag ? tag.name : tagId;
  };
  
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  if (filteredFiles.length === 0) {
    return (
      <div className="p-4">
        <Empty 
          label="No files found"
          description="Upload files to get started"
          onCreateFolder={onCreateFolder}
          onUploadClick={onUploadClick}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
        />
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-auto p-4">
      {viewMode === 'grid' ? (
        <GridView
          files={filteredFiles}
          selectedFileIds={selectedFileIds}
          onFileClick={handleFileClick}
          onSelectAll={handleSelectAll}
          isCreatorView={isCreatorView}
          onFileDeleted={onFileDeleted}
          onAddTagToFile={onAddTagToFile}
          availableTags={availableTags}
          getTagNameById={getTagNameById}
          onRefresh={onRefresh}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange || function(query: string) { setSearchQuery(query); }}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          allAvailableTags={allAvailableTags}
          onTagCreate={onTagCreate}
        />
      ) : (
        <ListView
          files={filteredFiles}
          selectedFileIds={selectedFileIds}
          onFileClick={handleFileClick}
          onSelectAll={handleSelectAll}
          isCreatorView={isCreatorView}
          onFileDeleted={onFileDeleted}
          onAddTagToFile={onAddTagToFile}
          availableTags={availableTags}
          getTagNameById={getTagNameById}
          onRefresh={onRefresh}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange || function(query: string) { setSearchQuery(query); }}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          allAvailableTags={allAvailableTags}
          onTagCreate={onTagCreate}
        />
      )}
      
      {onUploadClick && <UploadArea onUploadClick={onUploadClick} />}
    </div>
  );
};
