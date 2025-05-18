
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileCard } from './FileCard';
import { FileSelection } from './FileSelection';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
  isNewlyUploaded?: boolean;
  isSelected?: boolean;
  onSelectFile?: (id: string, selected: boolean) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
}

interface FileGridContainerProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  selectedFileIds?: string[];
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
}

export function FileGridContainer({
  files,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  selectedFileIds = [],
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote,
  onAddTag
}: FileGridContainerProps) {
  return (
    <>
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isCreatorView={isCreatorView}
          onFilesChanged={onFilesChanged}
          onFileDeleted={onFileDeleted}
          isNewlyUploaded={recentlyUploadedIds.includes(file.id)}
          isSelected={selectedFileIds.includes(file.id)}
          onSelectFile={onSelectFiles ? (id, selected) => {
            if (!onSelectFiles) return;
            
            if (selected) {
              onSelectFiles([...selectedFileIds, id]);
            } else {
              onSelectFiles(selectedFileIds.filter(fileId => fileId !== id));
            }
          } : undefined}
          currentFolder={currentFolder}
          onRemoveFromFolder={onRemoveFromFolder}
          onEditNote={onEditNote}
          onAddTag={onAddTag}
        />
      ))}
    </>
  );
}
