
import React, { createContext, useContext, ReactNode } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

interface FileExplorerContextProps {
  // File selection
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  
  // Current navigation state
  currentFolder: string;
  currentCategory: string | null;
  
  // Modal controls
  handleAddToFolderClick: () => void;
  handleInitiateNewCategory: () => void;
  handleInitiateNewFolder: (categoryId?: string) => void;
  handleDeleteCategoryClick: (categoryId: string) => void;
  handleRenameCategoryClick: (categoryId: string, currentName: string) => void;
  handleDeleteFolderClick: (folderId: string) => void;
  handleRenameFolderClick: (folderId: string, currentName: string) => void;
  
  // Creator information
  creatorName: string;
  creatorId: string;
  isCreatorView: boolean;
  
  // Folder operations
  availableFolders: Folder[];
  availableCategories: Category[];
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onCategoryChange: (categoryId: string | null) => void;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory: (categoryId: string, newName: string) => Promise<void>;
  
  // UI state
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

const FileExplorerContext = createContext<FileExplorerContextProps | undefined>(undefined);

export const useFileExplorerContext = () => {
  const context = useContext(FileExplorerContext);
  if (context === undefined) {
    throw new Error('useFileExplorerContext must be used within a FileExplorerProvider');
  }
  return context;
};

export const FileExplorerProvider: React.FC<{
  children: ReactNode;
  value: FileExplorerContextProps;
}> = ({ children, value }) => {
  return (
    <FileExplorerContext.Provider value={value}>
      {children}
    </FileExplorerContext.Provider>
  );
};
