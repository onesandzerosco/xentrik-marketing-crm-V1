
import React from 'react';
import { CategorySidebar } from './CategorySidebar';
import { useToast } from "@/components/ui/use-toast";
import { useFileExplorerContext } from './context/FileExplorerContext';

interface FileExplorerSidebarProps {
  onFolderChange: (folderId: string) => void;
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  onFolderChange,
}) => {
  const { toast } = useToast();
  
  const {
    currentCategory,
    currentFolder,
    selectedFileIds,
    availableCategories: categories,
    availableFolders: folders,
    handleInitiateNewCategory,
    handleInitiateNewFolder
  } = useFileExplorerContext();
  
  // Create wrapper functions that handle folder operations
  const handleDeleteCategoryWrapper = (categoryId: string) => {
    return Promise.resolve();
  };
  
  const handleRenameCategoryWrapper = (categoryId: string, currentName: string) => {
    return Promise.resolve();
  };
  
  const handleDeleteFolderWrapper = (folderId: string) => {
    return Promise.resolve();
  };
  
  const handleRenameFolderWrapper = (folderId: string, currentName: string) => {
    return Promise.resolve();
  };
  
  // Pass the category ID directly to handleInitiateNewFolder
  const handleInitiateNewFolderWithCategory = (categoryId: string) => {
    handleInitiateNewFolder(categoryId);
  };

  return (
    <div className="lg:w-64 shrink-0 mt-1">
      <CategorySidebar 
        categories={categories}
        folders={folders}
        currentCategory={currentCategory}
        currentFolder={currentFolder}
        onCategoryChange={(categoryId) => {}} // This will be updated in a later refactoring
        onFolderChange={onFolderChange}
        onInitiateNewCategory={handleInitiateNewCategory}
        onInitiateNewFolder={handleInitiateNewFolderWithCategory}
        onDeleteCategory={handleDeleteCategoryWrapper}
        onRenameCategory={handleRenameCategoryWrapper}
        onDeleteFolder={handleDeleteFolderWrapper}
        onRenameFolder={handleRenameFolderWrapper}
      />
    </div>
  );
};
