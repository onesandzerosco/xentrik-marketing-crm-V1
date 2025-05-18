
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileCard } from './FileCard';

interface FileGridContainerProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
  recentlyUploadedIds: string[];
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const FileGridContainer: React.FC<FileGridContainerProps> = ({
  files,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onEditNote,
  onAddTag,
  currentFolder,
  onRemoveFromFolder
}) => {
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
          onFilesChanged={onFilesChanged}
          onFileDeleted={handleFileDelete}
          isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
          onEditNote={onEditNote}
          onAddTag={onAddTag}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
        />
      ))}
    </>
  );
};
