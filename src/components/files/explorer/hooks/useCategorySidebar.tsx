
import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseCategorySidebarProps {
  currentCategory: string | null;
  onInitiateNewFolder: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => Promise<void>; // Keep as Promise<void>
  onRenameCategoryClick: (categoryId: string, currentName: string) => void; 
  onDeleteFolder: (folderId: string) => Promise<void>; // Keep as Promise<void>
  onRenameFolderClick: (folderId: string, currentName: string) => void; 
}

export const useCategorySidebar = ({
  currentCategory,
  onInitiateNewFolder,
  onDeleteCategory,
  onRenameCategoryClick,
  onDeleteFolder,
  onRenameFolderClick
}: UseCategorySidebarProps) => {
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Effect to auto-expand the current category
  useEffect(() => {
    if (currentCategory) {
      setExpandedCategories(prev => ({
        ...prev,
        [currentCategory]: true
      }));
    }
  }, [currentCategory]);
  
  const toggleCategory = useCallback((e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  const handleDeleteCategory = useCallback(async (e: React.MouseEvent, categoryId: string) => {
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
  }, [onDeleteCategory, toast]);
  
  // This only triggers the modal to open - NOT the rename action itself
  const handleRenameCategory = useCallback((e: React.MouseEvent, categoryId: string, currentName: string) => {
    e.stopPropagation();
    onRenameCategoryClick(categoryId, currentName);
  }, [onRenameCategoryClick]);
  
  const handleDeleteFolder = useCallback(async (e: React.MouseEvent, folderId: string) => {
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
  }, [onDeleteFolder, toast]);
  
  // This only triggers the modal to open - NOT the rename action itself
  const handleRenameFolder = useCallback((e: React.MouseEvent, folderId: string, currentName: string) => {
    e.stopPropagation();
    onRenameFolderClick(folderId, currentName);
  }, [onRenameFolderClick]);
  
  const handleNewFolderClick = useCallback((e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    onInitiateNewFolder(categoryId);
  }, [onInitiateNewFolder]);

  return {
    expandedCategories,
    toggleCategory,
    handleDeleteCategory,
    handleRenameCategory,
    handleDeleteFolder,
    handleRenameFolder,
    handleNewFolderClick
  };
};
