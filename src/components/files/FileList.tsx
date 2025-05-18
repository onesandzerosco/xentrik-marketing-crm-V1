import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileListItem } from './list/FileListItem';
import { FileListHeader } from './list/FileListHeader';
import { FileListBatchActions } from './list/FileListBatchActions';
import { FileListEmptyState } from './list/FileListEmptyState';

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
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
  return (
    <div>
      <FileListHeader />
      {files.length === 0 ? (
        <FileListEmptyState />
      ) : (
        <>
          {files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              isCreatorView={isCreatorView}
              onFilesChanged={onFilesChanged}
              onFileDeleted={onFileDeleted}
              isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
              onEditNote={onEditNote}
              onAddTag={onAddTag}
            />
          ))}
          {isCreatorView && (
            <FileListBatchActions
              onAddToFolderClick={onAddToFolderClick}
              currentFolder={currentFolder}
              onRemoveFromFolder={onRemoveFromFolder}
            />
          )}
        </>
      )}
    </div>
  );
}
