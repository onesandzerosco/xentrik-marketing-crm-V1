
import React from 'react';
import { FileUploadModal } from '../FileUploadModal';
import { Category, Folder } from '@/types/fileTypes';

interface UploadModalsProps {
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  currentFolder: string;
  availableFolders: Folder[];  // Added this prop
  availableCategories: Category[];
  onUploadComplete?: (fileIds?: string[]) => void;
}

export const UploadModals: React.FC<UploadModalsProps> = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  creatorId,
  creatorName,
  currentFolder,
  availableFolders,  // Added this prop
  availableCategories,
  onUploadComplete,
}) => {
  return (
    <FileUploadModal 
      isOpen={isUploadModalOpen} 
      onOpenChange={setIsUploadModalOpen} 
      creatorId={creatorId}
      creatorName={creatorName}
      onUploadComplete={onUploadComplete}
      currentFolder={currentFolder}
      availableCategories={availableCategories}
    />
  );
};
