
import React from 'react';
import { useFilePermissions } from '@/utils/permissionUtils';
import { DefaultItems } from './sidebar/DefaultItems';
import { CategoriesSection } from './sidebar/CategoriesSection';
import { useCategorySidebar } from './hooks/useCategorySidebar';

interface Category {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  categoryId: string;
}

interface CategorySidebarProps {
  categories: Category[];
  folders: Folder[];
  currentCategory: string | null;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  onFolderChange: (folderId: string) => void;
  onInitiateNewCategory: () => void;
  onInitiateNewFolder: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRenameCategory: (categoryId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, currentName: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
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
  onRenameFolder
}) => {
  const { canManageFolders } = useFilePermissions();
  
  const {
    expandedCategories,
    toggleCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleDeleteFolder,
    handleRenameFolder,
    handleNewFolderClick
  } = useCategorySidebar({
    currentCategory,
    onInitiateNewFolder,
    onDeleteCategory,
    onRenameCategory,
    onDeleteFolder,
    onRenameFolder
  });

  return (
    <div className="space-y-1 pr-1">
      <div className="py-2">
        <h3 className="px-3 text-xs font-medium text-muted-foreground">Files</h3>
      </div>
      
      <DefaultItems 
        currentFolder={currentFolder}
        currentCategory={currentCategory}
        onFolderChange={onFolderChange}
        onCategoryChange={onCategoryChange}
      />
      
      <CategoriesSection 
        categories={categories}
        folders={folders}
        expandedCategories={expandedCategories}
        currentCategory={currentCategory}
        currentFolder={currentFolder}
        canManageFolders={canManageFolders}
        onInitiateNewCategory={onInitiateNewCategory}
        onToggleCategory={toggleCategory}
        onFolderChange={onFolderChange}
        onNewFolderClick={handleNewFolderClick}
        onRenameCategory={handleRenameCategory}
        onDeleteCategory={handleDeleteCategory}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />
    </div>
  );
};
