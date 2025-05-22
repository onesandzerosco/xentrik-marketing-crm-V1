
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
  
  // Data
  categories?: Category[];
  
  // Handlers - Updated to match the expected function signatures
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: () => void;
  handleRenameCategory: () => void;
  
  // Optional callbacks
  onCreateNewCategory?: () => void;
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
  handleCreateCategorySubmit,
  handleDeleteCategory,
  handleRenameCategory,
  onCreateNewCategory
}) => {
  const [newCategoryNameForRename, setNewCategoryNameForRename] = useState<string>('');
  
  // Effect to update the rename input field when the modal opens
  useEffect(() => {
    if (isRenameCategoryModalOpen) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);

  // Wrapper for rename submit to pass the new name to the handler
  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update the parent's newCategoryName with our local state before submitting
    setNewCategoryName(newCategoryNameForRename);
    handleRenameCategory();
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
        onCreate={onCreateNewCategory}
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
