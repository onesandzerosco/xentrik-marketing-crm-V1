
import React, { createContext, useContext } from 'react';
import { Category, Folder } from '@/types/fileTypes';

interface FileExplorerContextType {
  selectedFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
  currentFolder: string;
  currentCategory: string | null;
  handleAddToFolderClick: () => void;
  handleInitiateNewCategory: () => void;
  handleInitiateNewFolder: (categoryId: string) => void;
  creatorName: string;
  creatorId: string;
  isCreatorView: boolean;
  availableFolders: Folder[];
  availableCategories: Category[];
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

const FileExplorerContext = createContext<FileExplorerContextType | undefined>(undefined);

export const FileExplorerProvider: React.FC<{ value: FileExplorerContextType; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  return (
    <FileExplorerContext.Provider value={value}>
      {children}
    </FileExplorerContext.Provider>
  );
};

export const useFileExplorerContext = () => {
  const context = useContext(FileExplorerContext);
  if (context === undefined) {
    throw new Error('useFileExplorerContext must be used within a FileExplorerProvider');
  }
  return context;
};
