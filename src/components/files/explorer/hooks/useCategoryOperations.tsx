
import { useState } from 'react';
import { Category } from '@/types/fileTypes';
import { useToast } from '@/components/ui/use-toast';

interface UseCategoryOperationsProps {
  onCreateCategory: (categoryName: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
  onRefresh: () => void;
  availableCategories: Category[];
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export const useCategoryOperations = ({
  onCreateCategory,
  onDeleteCategory,
  onRenameCategory,
  onRefresh,
  availableCategories,
  currentCategory,
  onCategoryChange
}: UseCategoryOperationsProps) => {
  const toast = useToast();
  // Category modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isRenameCategoryModalOpen, setIsRenameCategoryModalOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
  const [categoryCurrentName, setCategoryCurrentName] = useState<string | null>(null);
  const [showNewFolderInCategory, setShowNewFolderInCategory] = useState(false);

  // Handle click on delete category button
  const handleDeleteCategoryClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteCategoryModalOpen(true);
  };

  // Handle click on rename category button  
  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    setCategoryToRename(categoryId);
    setCategoryCurrentName(currentName);
    setIsRenameCategoryModalOpen(true);
  };

  // Handle creating a new category
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as any;
    const categoryName = form.newCategoryName || newCategoryName;
    
    if (!categoryName.trim()) {
      return;
    }
    
    try {
      await onCreateCategory(categoryName);
      onRefresh();
      
      // Reset form state
      (form.setIsAddCategoryModalOpen || setIsAddCategoryModalOpen)(false);
      (form.setNewCategoryName || setNewCategoryName)('');
      
      toast.toast({
        title: "Category created",
        description: `Created category: ${categoryName}`
      });
      
      // If we're creating a category from the AddToFolder flow,
      // continue with folder creation after the category is created
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.toast({
        title: "Error creating category",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await onDeleteCategory(categoryToDelete);
      
      // If the deleted category is the current one, reset to 'all'
      if (currentCategory === categoryToDelete) {
        onCategoryChange(null);
      }
      
      onRefresh();
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
      
      toast.toast({
        title: "Category deleted",
        description: "Category and its folders have been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.toast({
        title: "Error deleting category",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle renaming a category
  const handleRenameCategory = async (
    categoryId: string | null, 
    newName: string, 
    setIsOpen: (open: boolean) => void, 
    setIdToRename: (id: string | null) => void
  ) => {
    if (!categoryId || !newName.trim() || !onRenameCategory) return;
    
    try {
      await onRenameCategory(categoryId, newName);
      onRefresh();
      setIsOpen(false);
      setIdToRename(null);
      
      toast.toast({
        title: "Category renamed",
        description: `Category renamed to "${newName}" successfully.`
      });
    } catch (error) {
      console.error('Error renaming category:', error);
      toast.toast({
        title: "Error renaming category",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle initiating a new category
  const handleInitiateNewCategory = () => {
    setIsAddCategoryModalOpen(true);
  };

  return {
    // State
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName,
    setCategoryCurrentName,
    showNewFolderInCategory,
    setShowNewFolderInCategory,
    
    // Handlers
    handleDeleteCategoryClick,
    handleRenameCategoryClick,
    handleCreateCategorySubmit,
    handleDeleteCategory,
    handleRenameCategory,
    handleInitiateNewCategory
  };
};
