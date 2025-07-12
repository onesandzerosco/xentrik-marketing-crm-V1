
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Category } from '@/types/fileTypes';
import { FolderIcon, X } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
  isCreatorView: boolean;
  isOpen?: boolean;
  onClose?: () => void;
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
  onRenameFolder,
  onRenameCategory,
  isCreatorView,
  isOpen = true,
  onClose
}) => {
  const { isCreator } = useAuth();
  const isMobile = useIsMobile();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryForNewFolder, setCategoryForNewFolder] = useState<string | null>(null);

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

  const handleInitiateNewCategory = () => {
    setIsAddingCategory(true);
  };

  const handleInitiateNewFolder = (categoryId: string) => {
    setCategoryForNewFolder(categoryId);
    // Additional logic if needed
  };

  // Modal opening handlers for rename operations
  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    console.log("Opening rename category modal for:", categoryId, currentName);
    // This will be handled by the global function in RenameCategoryModal
    if (typeof (window as any).openRenameCategoryModal === 'function') {
      (window as any).openRenameCategoryModal(categoryId, currentName);
    } else {
      console.warn("openRenameCategoryModal is not available");
    }
  };

  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    console.log("Opening rename folder modal for:", folderId, currentName);
    // This will be handled by the global function in RenameFolderModal
    if (typeof (window as any).openRenameFolderModal === 'function') {
      (window as any).openRenameFolderModal(folderId, currentName);
    } else {
      console.warn("openRenameFolderModal is not available");
    }
  };

  const sidebarContent = (
    <>
      {isMobile && onClose && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Folders</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {!isMobile && <h2 className="text-lg font-semibold">Folders</h2>}
      
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
      
      <CategorySidebar
        categories={availableCategories}
        folders={availableFolders}
        currentCategory={currentCategory}
        currentFolder={currentFolder}
        onCategoryChange={onCategoryChange}
        onFolderChange={onFolderChange}
        onInitiateNewCategory={handleInitiateNewCategory}
        onInitiateNewFolder={handleInitiateNewFolder}
        onDeleteCategory={onDeleteCategory || (async () => {})}
        onRenameCategory={handleRenameCategoryClick}
        onDeleteFolder={onDeleteFolder || (async () => {})}
        onRenameFolder={handleRenameFolderClick}
      />
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Mobile Sidebar */}
        <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background border-r z-50 transform transition-transform duration-300 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } overflow-y-auto`}>
          <div className="p-4 space-y-4">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-64 bg-muted/30 rounded-lg p-4 space-y-4 flex-shrink-0 h-full overflow-y-auto">
      {sidebarContent}
    </div>
  );
};
