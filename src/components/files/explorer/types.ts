
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

export interface FileExplorerContextValue {
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  currentFolder: string;
  currentCategory: string | null;
  handleAddToFolderClick: () => void;
  handleInitiateNewCategory: () => void;
  handleInitiateNewFolder: (categoryId?: string) => void;
  creatorName: string;
  creatorId: string;
  isCreatorView: boolean;
  availableFolders: Folder[];
  availableCategories: Category[];
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

export interface ModalWrapperProps {
  explorerState: any;
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  availableFolders: Folder[];
  availableCategories: Category[];
  onUploadComplete?: (fileIds?: string[]) => void;
}

export interface FileExplorerWrapperProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView?: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
}
