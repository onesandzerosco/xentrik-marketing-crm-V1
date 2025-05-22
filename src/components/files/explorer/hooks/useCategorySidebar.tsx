
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface UseCategorySidebarProps {
  currentCategory: string | null;
  onInitiateNewFolder: (categoryId: string) => void;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRenameCategory: (categoryId: string, currentName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder: (folderId: string, currentName: string) => Promise<void>;
}

export const useCategorySidebar = ({
  currentCategory,
  onInitiateNewFolder,
  onDeleteCategory,
  onRenameCategory,
  onDeleteFolder,
  onRenameFolder
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
  
  // This should just trigger the modal to open and NOT directly rename
  const handleRenameCategory = useCallback((e: React.MouseEvent, categoryId: string, currentName: string) => {
    e.stopPropagation();
    // We shouldn't call the API here - just pass the info to open a modal
    onRenameCategory(categoryId, currentName);
  }, [onRenameCategory]);
  
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
  
  // This should just trigger the modal to open and NOT directly rename
  const handleRenameFolder = useCallback((e: React.MouseEvent, folderId: string, currentName: string) => {
    e.stopPropagation();
    // We shouldn't call the API here - just pass the info to open a modal
    onRenameFolder(folderId, currentName);
  }, [onRenameFolder]);
  
  const handleNewFolderClick = useCallback((e: React.MouseEvent, categoryId: string) => {
    e.stopPropagation();
    // This calls the initiating function to open the modal
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
