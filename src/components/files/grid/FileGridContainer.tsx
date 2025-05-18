
import React from 'react';
import FileCard from './FileCard';
import { CreatorFileType } from '@/types/fileTypes';

interface FileGridContainerProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>; 
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
      {files.map((file, index) => (
        <FileCard
          key={file.id}
          file={file}
          isCreatorView={isCreatorView}
          onFilesChanged={onFilesChanged}
          onFileDeleted={onFileDeleted}
          isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
          onSelectFiles={onSelectFiles}
          index={index}
          onEditNote={onEditNote}
          onAddTag={onAddTag}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
        />
      ))}
    </>
  );
}
