
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
  
  useEffect(() => {
    if (isRenameCategoryModalOpen) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the current name with the new name before calling the handler
    setCategoryCurrentName(newCategoryNameForRename);
    handleRenameCategory(e);
  };

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
