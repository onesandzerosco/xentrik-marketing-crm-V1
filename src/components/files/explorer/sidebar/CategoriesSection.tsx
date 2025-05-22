
import React from 'react';
import { Category, Folder } from '@/types/fileTypes';
import { CategoryItem } from './CategoryItem';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoriesSectionProps {
  categories: Category[];
  folders: Folder[];
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onDeleteCategoryClick?: (categoryId: string) => void;
  onRenameCategoryClick?: (categoryId: string, currentName: string) => void;
  onCreateCategoryClick?: () => void;
  onCreateFolderClick?: (categoryId: string) => void;
  isCreatorView?: boolean;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  folders,
  currentCategory,
  onCategoryChange,
  onDeleteCategoryClick,
  onRenameCategoryClick,
  onCreateCategoryClick,
  onCreateFolderClick,
  isCreatorView = false
}) => {
  const handleRenameClick = (categoryId: string, categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRenameCategoryClick) {
      onRenameCategoryClick(categoryId, categoryName);
    }
  };

  const handleDeleteClick = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteCategoryClick) {
      onDeleteCategoryClick(categoryId);
    }
  };

  const handleCreateFolderClick = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCreateFolderClick) {
      onCreateFolderClick(categoryId);
    }
  };

  return (
    <div className="mb-4 space-y-1">
      <div className="flex items-center justify-between px-2 mb-2">
        <h3 className="text-sm font-medium">Categories</h3>
        {isCreatorView && onCreateCategoryClick && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={onCreateCategoryClick}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add Category</span>
          </Button>
        )}
      </div>
      
      {categories.length > 0 ? (
        <div className="space-y-1">
          {categories.map(category => {
            const categoryFolders = folders.filter(f => f.categoryId === category.id);
            
            return (
              <CategoryItem 
                key={category.id}
                category={category}
                folders={categoryFolders}
                isSelected={currentCategory === category.id}
                onSelect={() => onCategoryChange(category.id)}
                onRenameClick={(e) => handleRenameClick(category.id, category.name, e)}
                onDeleteClick={(e) => handleDeleteClick(category.id, e)}
                onCreateFolderClick={(e) => handleCreateFolderClick(category.id, e)}
                isCreatorView={isCreatorView}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground px-2">
          {isCreatorView ? "No categories yet. Create one to organize your files." : "No categories available."}
        </div>
      )}
    </div>
  );
};
