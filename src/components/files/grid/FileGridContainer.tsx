
import React from 'react';
import { FileCard } from './FileCard';
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
  const handleFileDelete = async (fileId: string): Promise<void> => {
    if (onFileDeleted) {
      return onFileDeleted(fileId);
    }
    return Promise.resolve();
  };

  return (
    <>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isCreatorView={isCreatorView}
          isSelectable={!!onSelectFiles}
          isEditable={isCreatorView}
          isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
          onFileDeleted={handleFileDelete}
          onDelete={handleFileDelete}
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
