
import React, { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileListItem } from './list/FileListItem';
import { FileListHeader } from './list/FileListHeader';
import { FileListBatchActions } from './list/FileListBatchActions';
import { FileListEmptyState } from './list/FileListEmptyState';

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
}

export function FileList({
  files,
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote,
  onAddTag
}: FileListProps) {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const isAllSelected = files.length > 0 && selectedFileIds.length === files.length;
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(file => file.id));
    }
  };
  
  // Determine if we should show remove from folder option
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';
  
  // Handle removing files from the current folder
  const handleRemoveFromFolder = () => {
    if (selectedFileIds.length > 0 && onRemoveFromFolder && currentFolder !== 'all' && currentFolder !== 'unsorted') {
      onRemoveFromFolder(selectedFileIds, currentFolder);
      setSelectedFileIds([]);
    }
  };
  
  return (
    <div className="w-full mt-4">
      <FileListHeader 
        isCreatorView={isCreatorView} 
        isAllSelected={isAllSelected} 
        handleSelectAll={handleSelectAll} 
      />
      
      {files.length === 0 ? (
        <FileListEmptyState isCreatorView={isCreatorView} />
      ) : (
        <>
          {files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              isCreatorView={isCreatorView}
              onFilesChanged={onFilesChanged}
              onFileDeleted={onFileDeleted}
              isSelected={selectedFileIds.includes(file.id)}
              onSelect={(id, selected) => {
                if (selected) {
                  setSelectedFileIds([...selectedFileIds, id]);
                } else {
                  setSelectedFileIds(selectedFileIds.filter(fileId => fileId !== id));
                }
              }}
              onEditNote={onEditNote}
              onAddTag={onAddTag}
            />
          ))}
          
          {isCreatorView && selectedFileIds.length > 0 && (
            <FileListBatchActions
              selectedFileIds={selectedFileIds}
              onAddToFolderClick={onAddToFolderClick}
              currentFolder={currentFolder}
              showRemoveFromFolder={showRemoveFromFolder}
              handleRemoveFromFolder={handleRemoveFromFolder}
              onRemoveFromFolder={onRemoveFromFolder}
            />
          )}
        </>
      )}
    </div>
  );
}
