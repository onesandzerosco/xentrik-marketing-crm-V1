
import React from 'react';
import { FileCard } from '../grid/FileCard';
import { FileGridHeader } from '../grid/FileGridHeader';
import { EmptyState } from '../grid/EmptyState';
import { CreatorFileType } from '@/types/fileTypes';

interface FileExplorerViewProps {
  files: CreatorFileType[];
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onFileDeleted: (fileId: string) => void;
  onAddTagToFile: (file: CreatorFileType) => void;
}

export const FileExplorerView: React.FC<FileExplorerViewProps> = ({
  files,
  selectedFileIds,
  setSelectedFileIds,
  viewMode,
  setViewMode,
  onFileDeleted,
  onAddTagToFile
}) => {
  if (files.length === 0) {
    return <EmptyState />;
  }

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prevSelected => 
      prevSelected.includes(fileId)
        ? prevSelected.filter(id => id !== fileId)
        : [...prevSelected, fileId]
    );
  };

  return (
    <div className="w-full">
      <FileGridHeader
        selectedCount={selectedFileIds.length}
        totalCount={files.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearSelection={() => setSelectedFileIds([])}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {files.map(file => (
          <FileCard
            key={file.id}
            file={file}
            isSelected={selectedFileIds.includes(file.id)}
            onSelect={() => toggleFileSelection(file.id)}
            onDelete={onFileDeleted}
            onAddTag={() => onAddTagToFile(file)}
          />
        ))}
      </div>
    </div>
  );
};
