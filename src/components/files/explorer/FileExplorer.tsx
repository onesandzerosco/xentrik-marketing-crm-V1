
import React from 'react';
import { FileExplorerProvider } from './context/FileExplorerProvider';
import { FileExplorerContainer } from './FileExplorerContainer';
import { Category, CreatorFileType, Folder } from '@/types/fileTypes';
import { useFileTags } from '@/hooks/useFileTags';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  currentFolder: string;
  onFolderChange: (folderId: string) => void;
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  currentFolder,
  onFolderChange,
  currentCategory,
  onCategoryChange,
  availableFolders,
  availableCategories,
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds,
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  // Pass the creatorId to useFileTags
  const { 
    availableTags, 
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags
  } = useFileTags({ creatorId });
  
  return (
    <FileExplorerProvider
      files={files}
      creatorName={creatorName}
      creatorId={creatorId}
      isLoading={isLoading}
      onRefresh={onRefresh}
      currentFolder={currentFolder}
      onFolderChange={onFolderChange}
      currentCategory={currentCategory}
      onCategoryChange={onCategoryChange}
      availableFolders={availableFolders}
      availableCategories={availableCategories}
      isCreatorView={isCreatorView}
      onUploadComplete={onUploadComplete}
      onUploadStart={onUploadStart}
      recentlyUploadedIds={recentlyUploadedIds}
      availableTags={availableTags}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      addTagToFiles={addTagToFiles}
      removeTagFromFiles={removeTagFromFiles}
      createTag={createTag}
      onCreateFolder={onCreateFolder}
      onCreateCategory={onCreateCategory}
      onAddFilesToFolder={onAddFilesToFolder}
      onDeleteFolder={onDeleteFolder}
      onDeleteCategory={onDeleteCategory}
      onRemoveFromFolder={onRemoveFromFolder}
      onRenameFolder={onRenameFolder}
      onRenameCategory={onRenameCategory}
    >
      <FileExplorerContainer />
    </FileExplorerProvider>
  );
};
