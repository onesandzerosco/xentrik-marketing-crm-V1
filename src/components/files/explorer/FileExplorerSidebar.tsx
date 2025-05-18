
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Category } from '@/types/fileTypes';
import { FolderIcon, FolderPlus, PlusCircle, MoreHorizontal, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FileExplorerSidebarProps {
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  isCreatorView: boolean;
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  onCreateCategory,
  onDeleteFolder,
  onDeleteCategory,
  isCreatorView
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Helper to get all folders in a category
  const getFoldersInCategory = (categoryId: string | null) => {
    return availableFolders.filter(folder => {
      if (categoryId === null) {
        // Only get folders that don't have a category
        return !folder.categoryId || folder.categoryId === 'all';
      }
      return folder.categoryId === categoryId;
    });
  };
  
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !onCreateCategory) return;
    
    try {
      await onCreateCategory(newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  return (
    <div className="w-64 bg-muted/30 rounded-lg p-4 space-y-4 flex-shrink-0">
      <h2 className="text-lg font-semibold">Folders</h2>
      
      <div className="space-y-1">
        <Button
          variant={currentFolder === 'all' && !currentCategory ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            onFolderChange('all');
            onCategoryChange(null);
          }}
        >
          <FolderIcon className="w-4 h-4 mr-2" />
          All Files
        </Button>
        
        <Button
          variant={currentFolder === 'unsorted' ? "secondary" : "ghost"}
          className="w-full justify-start"
          onClick={() => {
            onFolderChange('unsorted');
            onCategoryChange(null);
          }}
        >
          <FolderIcon className="w-4 h-4 mr-2" />
          Unsorted
        </Button>
      </div>
      
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium">Categories</h3>
          {isCreatorView && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsAddingCategory(true)}>
              <PlusCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isAddingCategory && (
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              className="flex-1 h-8 px-2 text-sm rounded border border-input bg-background"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <Button 
              size="sm" 
              className="h-8 px-2"
              onClick={handleCreateCategory}
            >
              Add
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => setIsAddingCategory(false)}
            >
              &times;
            </Button>
          </div>
        )}
        
        <div className="space-y-1">
          {availableCategories.map((category) => {
            const foldersInCategory = getFoldersInCategory(category.id);
            const isActiveCategory = currentCategory === category.id;
            
            return (
              <div key={category.id} className="space-y-1">
                <div className="flex items-center">
                  <Button
                    variant={isActiveCategory ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onCategoryChange(category.id);
                      onFolderChange('all'); // Reset to showing all files in this category
                    }}
                  >
                    {category.name}
                  </Button>
                  
                  {isCreatorView && onDeleteCategory && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDeleteCategory(category.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                {isActiveCategory && foldersInCategory.map((folder) => {
                  if (folder.id === 'all' || folder.id === 'unsorted') return null;
                  
                  return (
                    <div key={folder.id} className="flex items-center pl-4">
                      <Button
                        variant={currentFolder === folder.id ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => onFolderChange(folder.id)}
                      >
                        <FolderIcon className="w-4 h-4 mr-2" />
                        {folder.name}
                      </Button>
                      
                      {isCreatorView && onDeleteFolder && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDeleteFolder(folder.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-3 h-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
