
import React, { useEffect, useState } from 'react';
import { CreateCategoryModal } from '../CreateCategoryModal';
import { DeleteModal } from '../DeleteModal';
import { RenameModal } from '../RenameModal';
import { Category } from '@/types/fileTypes';

interface CategoryModalsProps {
  // Category creation modal
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  
  // Category deletion modal
  isDeleteCategoryModalOpen: boolean;
  setIsDeleteCategoryModalOpen: (open: boolean) => void;
  
  // Category rename modal
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  categoryCurrentName: string;
  setCategoryCurrentName: (name: string) => void;
  categoryToRename: string | null;
  
  // Data
  categories?: Category[];
  
  // Handlers
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: () => void;
  handleRenameCategory: (e: React.FormEvent) => void;
}

export const CategoryModals: React.FC<CategoryModalsProps> = ({
  isAddCategoryModalOpen,
  setIsAddCategoryModalOpen,
  newCategoryName,
  setNewCategoryName,
  isDeleteCategoryModalOpen,
  setIsDeleteCategoryModalOpen,
  isRenameCategoryModalOpen,
  setIsRenameCategoryModalOpen,
  categoryCurrentName,
  setCategoryCurrentName,
  categoryToRename,
  handleCreateCategorySubmit,
  handleDeleteCategory,
  handleRenameCategory,
}) => {
  const [newCategoryNameForRename, setNewCategoryNameForRename] = useState<string>('');
  
  // When the modal opens, set the name field to the current name
  useEffect(() => {
    if (isRenameCategoryModalOpen) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);

  // Handle form submission in the rename modal
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the current name with the new name before calling the handler
    setCategoryCurrentName(newCategoryNameForRename);
    // This now calls the API to update the database
    handleRenameCategory(e);
  };

  // Create a global function that other components can call to open the modal
  useEffect(() => {
    // @ts-ignore - Adding a custom method to window
    window.openRenameCategoryModal = (categoryId: string, currentName: string) => {
      setCategoryCurrentName(currentName);
      setIsRenameCategoryModalOpen(true);
    };
    
    return () => {
      // @ts-ignore - Cleanup
      delete window.openRenameCategoryModal;
    };
  }, [setCategoryCurrentName, setIsRenameCategoryModalOpen]);

  return (
    <>
      {/* Create Category Modal */}
      <CreateCategoryModal 
        isOpen={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleSubmit={handleCreateCategorySubmit}
      />
      
      {/* Delete Category Modal */}
      <DeleteModal 
        isOpen={isDeleteCategoryModalOpen}
        onOpenChange={setIsDeleteCategoryModalOpen}
        title="Delete Category"
        description="Are you sure you want to delete this category? All folders in this category will be deleted and files will be moved to Unsorted Uploads."
        onConfirm={handleDeleteCategory}
      />
      
      {/* Rename Category Modal */}
      <RenameModal 
        isOpen={isRenameCategoryModalOpen}
        onOpenChange={setIsRenameCategoryModalOpen}
        title="Rename Category"
        currentName={newCategoryNameForRename}
        setNewName={setNewCategoryNameForRename}
        onConfirm={handleRenameSubmit}
      />
    </>
  );
};
