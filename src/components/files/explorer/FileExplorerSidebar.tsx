
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Folder, Category } from '@/types/fileTypes';
import { FolderIcon } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';
import { ContentGuideDownloader } from '@/components/onboarding/ContentGuideDownloader';
import { useAuth } from '@/context/AuthContext';

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
  isCreatorView
}) => {
  const { isCreator } = useAuth();
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

  return (
    <div className="w-64 bg-muted/30 rounded-lg p-4 space-y-4 flex-shrink-0 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold">Folders</h2>
      
      {/* Content Guide Download Button - Only show for Creators */}
      {isCreator && (
        <div className="pb-2">
          <ContentGuideDownloader />
        </div>
      )}
      
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
    </div>
  );
};
