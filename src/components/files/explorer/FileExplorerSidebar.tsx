
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
  
  // Check if there are selected files for creating a new folder
  const handleInitiateNewFolderWithCheck = (categoryId: string) => {
    if (selectedFileIds.length > 0) {
      handleInitiateNewFolder();
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
        onCategoryChange={(categoryId) => {}} // This will be updated in a later refactoring
        onFolderChange={onFolderChange}
        onInitiateNewCategory={handleInitiateNewCategory}
        onInitiateNewFolder={handleInitiateNewFolderWithCheck}
        onDeleteCategory={() => {}} // This will be updated in a later refactoring
        onRenameCategory={() => {}} // This will be updated in a later refactoring
        onDeleteFolder={() => {}} // This will be updated in a later refactoring
        onRenameFolder={() => {}} // This will be updated in a later refactoring
      />
    </div>
  );
};
