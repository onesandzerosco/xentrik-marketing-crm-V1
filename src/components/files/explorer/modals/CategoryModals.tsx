
import React, { useEffect } from 'react';
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
  
  // Handlers
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: (categoryId: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => void;
  handleRenameCategory: (categoryId: string | null, newName: string, setIsRenameCategoryModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => void;
  
  // Callbacks
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
  onCreateNewCategory,
}) => {
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);
  const [categoryToRename, setCategoryToRename] = React.useState<string | null>(null);
  const [newCategoryNameForRename, setNewCategoryNameForRename] = React.useState<string>('');
  
  useEffect(() => {
    if (isRenameCategoryModalOpen) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);
  
  const onDeleteCategory = () => {
    handleDeleteCategory(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };
  
  const onRenameCategory = () => {
    handleRenameCategory(categoryToRename, newCategoryNameForRename, setIsRenameCategoryModalOpen, setCategoryToRename);
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
        onOpenChange={(open) => {
          setIsDeleteCategoryModalOpen(open);
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category? All folders within the category will also be deleted. Files will be moved to Unsorted Uploads."
        onConfirm={onDeleteCategory}
      />
      
      {/* Rename Category Modal */}
      <RenameModal
        isOpen={isRenameCategoryModalOpen}
        onOpenChange={(open) => {
          setIsRenameCategoryModalOpen(open);
          if (!open) setCategoryToRename(null);
        }}
        title="Rename Category"
        currentName={newCategoryNameForRename}
        setNewName={setNewCategoryNameForRename}
        onConfirm={onRenameCategory}
      />
    </>
  );
};
