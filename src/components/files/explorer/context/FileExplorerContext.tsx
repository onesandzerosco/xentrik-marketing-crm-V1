
import React, { createContext, useContext, ReactNode } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerContextProps {
  // File selection
  selectedFileIds: string[];
  setSelectedFileIds: (fileIds: string[]) => void;
  
  // Current navigation state
  currentFolder: string;
  currentCategory: string | null;
  
  // File data
  filteredFiles: CreatorFileType[];
  
  // Modal controls
  onAddTagClick: () => void;
  onAddTagToFile: (file: CreatorFileType) => void;
  
  // Tags
  availableTags: FileTag[];
  selectedTags: string[];
  setSelectedTags: (tags: string[] | ((prev: string[]) => string[])) => void;
  onTagSelect: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  
  // Creator information
  creatorName: string;
  creatorId: string;
  isCreatorView: boolean;
  
  // File operations
  onFileDeleted: (fileId: string) => void;
  
  // UI state
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[] | ((prev: string[]) => string[])) => void;
  
  // Upload controls
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  onRefresh: () => void;
  
  // Folder operations
  onFolderChange: (folderId: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
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
