
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Category } from '@/types/fileTypes';
import DragDropUploader from '../upload/DragDropUploader';

interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  currentFolder: string;
  availableCategories: Category[];
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onOpenChange,
  creatorId,
  creatorName,
  onUploadComplete,
  currentFolder,
  availableCategories
}) => {
  // Prevent modal from rendering if it's not open
  if (!isOpen) {
    return null;
  }

  // This function is called when the upload is complete
  const handleUploadComplete = (fileIds?: string[]) => {
    if (onUploadComplete) {
      onUploadComplete(fileIds);
    }
    // Only close the modal after the upload is complete
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to {creatorName}'s storage
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden flex flex-col">
          <DragDropUploader 
            creatorId={creatorId} 
            onUploadComplete={handleUploadComplete}
            onCancel={() => onOpenChange(false)}
            currentFolder={currentFolder}
            availableCategories={availableCategories}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
