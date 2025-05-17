
import React from 'react';
import { Folder, FolderPlus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderNav } from '@/components/files/FolderNav';
import { Category } from '@/types/fileTypes';
import { useFilePermissions } from '@/utils/permissionUtils';

interface CategorySidebarProps {
  categories: Category[];
  folders: Array<{ id: string; name: string; categoryId?: string }>;
  currentCategory: string | null;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  onFolderChange: (folderId: string) => void;
  onInitiateNewCategory?: () => void;
  onInitiateNewFolder?: (categoryId: string) => void;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, currentName: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, currentName: string) => Promise<void>;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories = [],
  folders = [],
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
  const { canManageCategories } = useFilePermissions();
  
  // Filter folders for the current category
  const currentCategoryFolders = currentCategory 
    ? folders.filter(folder => folder.categoryId === currentCategory)
    : folders.filter(folder => folder.id === 'all' || folder.id === 'unsorted');
  
  // Create a folder in the selected category
  const handleCreateFolderInCategory = (categoryId: string) => {
    if (onInitiateNewFolder) {
      onInitiateNewFolder(categoryId);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-md font-semibold">Categories</h2>
        {canManageCategories && onInitiateNewCategory && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onInitiateNewCategory}
            title="Create new category"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-2 space-y-1">
        <Button
          variant={!currentCategory ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start px-3 font-normal"
          onClick={() => onCategoryChange(null)}
        >
          All Categories
        </Button>
        
        {categories.map((category) => (
          <div key={category.id} className="mt-1">
            <div className="flex items-center justify-between group">
              <Button
                variant={currentCategory === category.id ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start px-3 font-normal"
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </Button>
              
              {/* Add New Folder button for each category */}
              {canManageCategories && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateFolderInCategory(category.id);
                  }}
                  title="Add folder to this category"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex-grow overflow-y-auto">
        <FolderNav
          folders={currentCategoryFolders}
          currentFolder={currentFolder}
          onFolderChange={onFolderChange}
          activeFolder={currentFolder}
          onInitiateNewFolder={currentCategory ? () => onInitiateNewFolder?.(currentCategory) : undefined}
          onDeleteFolder={onDeleteFolder}
          onRenameFolder={onRenameFolder}
        />
      </div>
    </div>
  );
};
