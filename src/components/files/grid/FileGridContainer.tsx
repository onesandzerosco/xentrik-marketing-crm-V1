
import React from 'react';
import { FileCard } from './FileCard';
import { CreatorFileType } from '@/types/fileTypes';

interface FileGridContainerProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void; 
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export function FileGridContainer({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  onEditNote,
  onAddTag,
  currentFolder = 'all',
  onRemoveFromFolder
}: FileGridContainerProps) {
  return (
    <>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isSelectable={!!onSelectFiles}
          isEditable={isCreatorView}
          isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
          onDelete={onFileDeleted}
          onFilesChanged={onFilesChanged}
          onEditNote={onEditNote}
          onAddTag={onAddTag}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
        />
      ))}
    </>
  );
}
