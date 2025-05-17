
import React from 'react';
import { CreateCategoryModal } from '../CreateCategoryModal';
import { DeleteModal } from '../DeleteModal';
import { RenameModal } from '../RenameModal';

interface CategoryModalsProps {
  isAddCategoryModalOpen: boolean;
  setIsAddCategoryModalOpen: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  isDeleteCategoryModalOpen: boolean;
  setIsDeleteCategoryModalOpen: (open: boolean) => void;
  isRenameCategoryModalOpen: boolean;
  setIsRenameCategoryModalOpen: (open: boolean) => void;
  categoryCurrentName: string;
  categoryToDelete: string | null;
  setCategoryToDelete: (id: string | null) => void;
  categoryToRename: string | null;
  setCategoryToRename: (id: string | null) => void;
  handleCreateCategorySubmit: (e: React.FormEvent) => void;
  handleDeleteCategory: (categoryId: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => void;
  handleRenameCategory: (categoryId: string | null, newName: string, setIsRenameCategoryModalOpen: (open: boolean) => void, setCategoryToRename: (id: string | null) => void) => void;
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
  categoryToDelete,
  setCategoryToDelete,
  categoryToRename,
  setCategoryToRename,
  handleCreateCategorySubmit,
  handleDeleteCategory,
  handleRenameCategory,
  onCreateNewCategory
}) => {
  const [newCategoryNameForRename, setNewCategoryNameForRename] = React.useState<string>('');
  
  React.useEffect(() => {
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
      <CreateCategoryModal 
        isOpen={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleSubmit={handleCreateCategorySubmit}
      />
      
      <DeleteModal 
        isOpen={isDeleteCategoryModalOpen}
        onOpenChange={(open) => {
          setIsDeleteCategoryModalOpen(open);
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete Category"
        description="Are you sure you want to delete this category and all folders within it? Files will be moved to Unsorted Uploads."
        onConfirm={onDeleteCategory}
      />
      
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
