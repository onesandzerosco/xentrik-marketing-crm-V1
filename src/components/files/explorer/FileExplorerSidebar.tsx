
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
    handleInitiateNewFolder,
    handleDeleteCategory,
    handleRenameCategory,
    handleDeleteFolder,
    handleRenameFolder
  } = useFileExplorerContext();
  
  // Check if there are selected files for creating a new folder
  const handleInitiateNewFolderWithCheck = (categoryId: string) => {
    if (selectedFileIds.length > 0) {
      handleInitiateNewFolder(categoryId);
    } else {
      toast({
        title: "Select files first",
        description: "Please select at least one file to add to a new folder",
      });
    }
  };

  // Create wrapper functions with the correct signatures that match what CategorySidebar expects
  const deleteCategory = async (categoryId: string) => {
    return new Promise<void>((resolve) => {
      // Using dummy state setters since we're just creating a wrapper
      const dummySetModal = () => {};
      const dummySetId = () => {};
      
      // Call the context function with the right parameters
      handleDeleteCategory(
        categoryId, 
        dummySetModal, 
        dummySetId
      ).then(resolve);
    });
  };
  
  const renameCategory = async (categoryId: string, newName: string) => {
    return new Promise<void>((resolve) => {
      const dummySetModal = () => {};
      const dummySetId = () => {};
      
      handleRenameCategory(
        categoryId, 
        newName,
        dummySetModal, 
        dummySetId
      ).then(resolve);
    });
  };
  
  const deleteFolder = async (folderId: string) => {
    return new Promise<void>((resolve) => {
      const dummySetModal = () => {};
      const dummySetId = () => {};
      
      handleDeleteFolder(
        folderId, 
        dummySetModal, 
        dummySetId
      ).then(resolve);
    });
  };
  
  const renameFolder = async (folderId: string, newName: string) => {
    return new Promise<void>((resolve) => {
      const dummySetModal = () => {};
      const dummySetId = () => {};
      
      handleRenameFolder(
        folderId, 
        newName,
        dummySetModal, 
        dummySetId
      ).then(resolve);
    });
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
        onDeleteCategory={deleteCategory}
        onRenameCategory={renameCategory}
        onDeleteFolder={deleteFolder}
        onRenameFolder={renameFolder}
      />
    </div>
  );
};
