
import React from 'react';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isProcessing = false
}) => {
  return (
    <ConfirmDeleteModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Delete Category?"
      description="This will permanently delete the category and all folders within it. Files within these folders will not be deleted, but they will no longer be associated with this category or its folders."
      confirmText="Delete Category"
      isProcessing={isProcessing}
    />
  );
};
