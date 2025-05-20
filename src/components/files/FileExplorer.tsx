
import React from 'react';
import { FileExplorerRefactored } from './explorer/FileExplorerRefactored';
import { Category, CreatorFileType, Folder } from '@/types/fileTypes';

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

export const FileExplorer: React.FC<FileExplorerProps> = (props) => {
  // Simply pass all props to the refactored component
  return <FileExplorerRefactored {...props} />;
};
