
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
  
  // Creator information
  creatorName: string;
  creatorId: string;
  isCreatorView: boolean;
  
  // Folder operations
  availableFolders: Folder[];
  availableCategories: Category[];
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  
  // Updated function signatures with all required parameters
  handleDeleteCategory: (categoryId: string, setModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => Promise<void>;
  handleRenameCategory: (categoryId: string, newName: string, setModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => Promise<void>;
  handleDeleteFolder: (folderId: string, setModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => Promise<void>;
  handleRenameFolder: (folderId: string, newName: string, setModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => Promise<void>;
  
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
