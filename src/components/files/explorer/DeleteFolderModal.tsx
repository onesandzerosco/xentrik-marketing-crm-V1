
import React from 'react';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
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
      title="Delete Folder"
      description="Are you sure you want to delete this folder? The files inside will not be deleted, but they will be moved to unsorted files."
      confirmText="Delete Folder"
      isProcessing={isProcessing}
    />
  );
};
