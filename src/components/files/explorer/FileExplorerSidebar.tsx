import React from 'react';
import { CategorySidebar } from './CategorySidebar';
import { useToast } from "@/components/ui/use-toast";
import { Folder, Category } from '@/types/fileTypes';

interface FileExplorerSidebarProps {
  categories: Category[];
  folders: Folder[];
  currentCategory: string | null;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  onFolderChange: (folderId: string) => void;
  onInitiateNewCategory: () => void;
  onInitiateNewFolder: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRenameCategory: (categoryId: string, currentName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, currentName: string) => Promise<void>;
  selectedFileIds: string[];
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  categories,
  folders,
  currentCategory,
  currentFolder,
  onCategoryChange,
  onFolderChange,
  onInitiateNewCategory,
  onInitiateNewFolder,
  onDeleteCategory,
  onRenameCategory,
  onDeleteFolder,
  onRenameFolder,
  selectedFileIds
}) => {
  const { toast } = useToast();
  
  // Check if there are selected files for creating a new folder
  const handleInitiateNewFolder = (categoryId: string) => {
    if (selectedFileIds.length > 0) {
      onInitiateNewFolder(categoryId);
    } else {
      toast({
        title: "Select files first",
        description: "Please select at least one file to add to a new folder",
      });
    }
  };

  return (
    <div className="lg:w-64 shrink-0 mt-1">
      <CategorySidebar 
        categories={categories}
        folders={folders}
        currentCategory={currentCategory}
        currentFolder={currentFolder}
        onCategoryChange={onCategoryChange}
        onFolderChange={onFolderChange}
        onInitiateNewCategory={onInitiateNewCategory}
        onInitiateNewFolder={handleInitiateNewFolder}
        onDeleteCategory={onDeleteCategory}
        onRenameCategory={onRenameCategory}
        onDeleteFolder={onDeleteFolder}
        onRenameFolder={onRenameFolder}
      />
    </div>
  );
};
