
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CategoryItem } from './CategoryItem';

interface Category {
  id: string;
  name: string;
}

interface Folder {
  id: string;
  name: string;
  categoryId: string;
}

interface CategoriesSectionProps {
  categories: Category[];
  folders: Folder[];
  expandedCategories: Record<string, boolean>;
  currentCategory: string | null;
  currentFolder: string;
  canManageFolders: boolean;
  onInitiateNewCategory: () => void;
  onToggleCategory: (e: React.MouseEvent, categoryId: string) => void;
  onFolderChange: (folderId: string) => void;
  onNewFolderClick: (e: React.MouseEvent, categoryId: string) => void;
  onRenameCategory: (e: React.MouseEvent, categoryId: string, currentName: string) => void;
  onDeleteCategory: (e: React.MouseEvent, categoryId: string) => void;
  onRenameFolder: (e: React.MouseEvent, folderId: string, currentName: string) => void;
  onDeleteFolder: (e: React.MouseEvent, folderId: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  folders,
  expandedCategories,
  currentCategory,
  currentFolder,
  canManageFolders,
  onInitiateNewCategory,
  onToggleCategory,
  onFolderChange,
  onNewFolderClick,
  onRenameCategory,
  onDeleteCategory,
  onRenameFolder,
  onDeleteFolder
}) => {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-3 mb-2">
        <h3 className="text-xs font-medium text-muted-foreground">Categories</h3>
        {canManageFolders && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={onInitiateNewCategory}
            title="Add new category"
          >
            <PlusCircle className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          isExpanded={expandedCategories[category.id] || false}
          currentCategory={currentCategory}
          currentFolder={currentFolder}
          folders={folders}
          canManageFolders={canManageFolders}
          onToggle={onToggleCategory}
          onFolderChange={onFolderChange}
          onNewFolderClick={onNewFolderClick}
          onRenameCategory={onRenameCategory}
          onDeleteCategory={onDeleteCategory}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}
    </div>
  );
};
