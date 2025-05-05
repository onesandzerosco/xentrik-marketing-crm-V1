
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useFileGrid } from './grid/useFileGrid';
import { FileGridHeader } from './grid/FileGridHeader';
import { EmptyState } from './grid/EmptyState';
import { FileGridContainer } from './grid/FileGridContainer';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void; 
  recentlyUploadedIds?: string[];
  onUploadClick?: () => void;
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
}

export function FileGrid({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote
}: FileGridProps) {
  const {
    selectedFileIds,
    setSelectedFileIds
  } = useFileGrid({
    files,
    onFilesChanged,
    onFileDeleted,
    onSelectFiles,
    currentFolder,
    onRemoveFromFolder
  });

  const { canManageFolders } = useFilePermissions();

  if (files.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mt-4">
      <FileGridHeader 
        selectedFileIds={selectedFileIds}
        isCreatorView={isCreatorView}
        onAddToFolderClick={canManageFolders ? onAddToFolderClick : undefined}
      />
      
      <FileGridContainer 
        files={files}
        isCreatorView={isCreatorView}
        onFilesChanged={onFilesChanged}
        onFileDeleted={onFileDeleted}
        recentlyUploadedIds={recentlyUploadedIds}
        onSelectFiles={setSelectedFileIds}
        onEditNote={onEditNote}
        currentFolder={currentFolder}
        onRemoveFromFolder={onRemoveFromFolder}
      />
    </div>
  );
}
