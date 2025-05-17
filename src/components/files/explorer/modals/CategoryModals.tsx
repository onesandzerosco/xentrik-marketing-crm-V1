
import React, { useEffect } from 'react';
import { CreateCategoryModal } from '../CreateCategoryModal';
import { DeleteCategoryModal } from '../DeleteCategoryModal';
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
  categoryToDelete: string | null;
  setCategoryToDelete: (id: string | null) => void;
  
  // Category rename modal
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  categoryCurrentName: string | null;
  
  // Available categories
  categories: Category[];
  
  // Handlers
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: () => void;
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
  categoryToDelete,
  setCategoryToDelete,
  isRenameCategoryModalOpen,
  setIsRenameCategoryModalOpen,
  categoryCurrentName,
  categories,
  handleCreateCategorySubmit,
  handleDeleteCategory,
  handleRenameCategory,
  onCreateNewCategory,
}) => {
  const [categoryToRename, setCategoryToRename] = React.useState<string | null>(null);
  const [newCategoryNameForRename, setNewCategoryNameForRename] = React.useState<string>('');
  
  // Get the category name for the deletion dialog
  const categoryToDeleteName = React.useMemo(() => {
    if (!categoryToDelete) return '';
    return categories.find(c => c.id === categoryToDelete)?.name || '';
  }, [categoryToDelete, categories]);
  
  useEffect(() => {
    if (isRenameCategoryModalOpen && categoryCurrentName) {
      setNewCategoryNameForRename(categoryCurrentName);
    }
  }, [isRenameCategoryModalOpen, categoryCurrentName]);
  
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
      <DeleteCategoryModal 
        isOpen={isDeleteCategoryModalOpen}
        onOpenChange={(open) => {
          setIsDeleteCategoryModalOpen(open);
          if (!open) setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        categoryName={categoryToDeleteName}
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
