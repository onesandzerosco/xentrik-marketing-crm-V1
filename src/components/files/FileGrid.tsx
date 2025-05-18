
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileGridContainer } from './grid/FileGridContainer';

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted: (fileId: string) => Promise<void>;
  recentlyUploadedIds: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds,
  onSelectFiles,
  onAddToFolderClick,
  currentFolder,
  onRemoveFromFolder,
  onEditNote,
  onAddTag
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      <FileGridContainer
        files={files}
        isCreatorView={isCreatorView}
        onFilesChanged={onFilesChanged}
        onFileDeleted={onFileDeleted}
        recentlyUploadedIds={recentlyUploadedIds}
        onEditNote={onEditNote}
        onAddTag={onAddTag}
        currentFolder={currentFolder}
        onRemoveFromFolder={onRemoveFromFolder}
      />
    </div>
  );
};
