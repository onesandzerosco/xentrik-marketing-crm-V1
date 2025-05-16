
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FolderPlus, Pencil, Trash2, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useFilePermissions } from '@/utils/permissionUtils';

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
  onRenameCategory: (categoryId: string, currentName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, currentName: string) => Promise<void>;
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
  const { toast } = useToast();
  const { canManageFolders } = useFilePermissions();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const handleNewFolderInCategory = (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    onInitiateNewFolder(categoryId);
  };
  
  const handleDeleteCategory = async (e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    try {
      await onDeleteCategory(categoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Error deleting category",
        description: "Failed to delete the category",
        variant: "destructive"
      });
    }
  };
  
  const handleRenameCategory = async (e: React.MouseEvent, categoryId: string, currentName: string) => {
    e.stopPropagation();
    try {
      await onRenameCategory(categoryId, currentName);
    } catch (error) {
      console.error("Error renaming category:", error);
      toast({
        title: "Error renaming category",
        description: "Failed to rename the category",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    try {
      await onDeleteFolder(folderId);
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: "Failed to delete the folder",
        variant: "destructive"
      });
    }
  };
  
  const handleRenameFolder = async (e: React.MouseEvent, folderId: string, currentName: string) => {
    e.stopPropagation();
    try {
      await onRenameFolder(folderId, currentName);
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast({
        title: "Error renaming folder",
        description: "Failed to rename the folder",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-1 pr-1">
      <div className="py-2">
        <h3 className="px-3 text-xs font-medium text-muted-foreground">Files</h3>
      </div>
      
      {/* All Files and Unsorted Uploads */}
      <Button
        variant={currentFolder === 'all' ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => {
          onCategoryChange(null);
          onFolderChange('all');
        }}
      >
        All Files
      </Button>
      
      <Button
        variant={currentFolder === 'unsorted' ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => {
          onCategoryChange(null);
          onFolderChange('unsorted');
        }}
      >
        Unsorted Uploads
      </Button>
      
      {/* Categories section */}
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
        
        {categories.map((category) => {
          const categoryFolders = folders.filter(folder => folder.categoryId === category.id);
          const isExpanded = expandedCategories[category.id] || false;
          
          return (
            <div key={category.id} className="mb-1">
              <div 
                className={`flex items-center px-3 py-1.5 cursor-pointer group hover:bg-accent hover:text-accent-foreground rounded-md ${
                  currentCategory === category.id ? 'bg-muted' : ''
                }`}
                onClick={() => {
                  toggleCategory(category.id);
                  onCategoryChange(category.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-1 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
                )}
                <span className="text-sm flex-1 truncate">{category.name}</span>
                
                {/* Category actions */}
                {canManageFolders && (
                  <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleNewFolderInCategory(e, category.id)}
                      title="New folder in this category"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleRenameCategory(e, category.id, category.name)}
                      title="Rename category"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteCategory(e, category.id)}
                      title="Delete category"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Folders under this category */}
              {isExpanded && categoryFolders.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {categoryFolders.map((folder) => (
                    <div 
                      key={folder.id} 
                      className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer group hover:bg-accent hover:text-accent-foreground ${
                        currentFolder === folder.id ? 'bg-secondary text-secondary-foreground' : ''
                      }`}
                      onClick={() => onFolderChange(folder.id)}
                    >
                      <span className="text-sm flex-1 truncate">{folder.name}</span>
                      
                      {/* Folder actions */}
                      {canManageFolders && (
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleRenameFolder(e, folder.id, folder.name)}
                            title="Rename folder"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleDeleteFolder(e, folder.id)}
                            title="Delete folder"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
