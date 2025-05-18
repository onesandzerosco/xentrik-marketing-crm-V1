
import React from 'react';
import { Folder, FolderOpen, Plus } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Folder as FolderType, Category } from '@/types/fileTypes';

interface FileExplorerSidebarProps {
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: FolderType[];
  availableCategories: Category[];
  onCreateFolder: () => void;
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  onCreateFolder
}) => {
  // Filter folders by category
  const filteredFolders = currentCategory 
    ? availableFolders.filter((folder) => folder.categoryId === currentCategory)
    : availableFolders;

  return (
    <div className="w-64 border-r bg-background hidden md:block">
      <ScrollArea className="h-full py-4">
        <div className="px-3 mb-2">
          <h3 className="text-sm font-medium mb-2">Categories</h3>
          <div className="space-y-1">
            <Button
              variant={!currentCategory ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
              onClick={() => onCategoryChange(null)}
            >
              All Categories
            </Button>
            
            {availableCategories.map((category) => (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm h-8"
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="px-3 mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Folders</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={onCreateFolder}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-1">
            <Button
              variant={currentFolder === 'all' ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
              onClick={() => onFolderChange('all')}
            >
              <Folder className="h-4 w-4 mr-2" />
              All Files
            </Button>
            
            <Button
              variant={currentFolder === 'unsorted' ? "secondary" : "ghost"}
              className="w-full justify-start text-sm h-8"
              onClick={() => onFolderChange('unsorted')}
            >
              <Folder className="h-4 w-4 mr-2" />
              Unsorted
            </Button>
            
            {filteredFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={currentFolder === folder.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm h-8"
                onClick={() => onFolderChange(folder.id)}
              >
                {currentFolder === folder.id ? (
                  <FolderOpen className="h-4 w-4 mr-2" />
                ) : (
                  <Folder className="h-4 w-4 mr-2" />
                )}
                {folder.name}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
