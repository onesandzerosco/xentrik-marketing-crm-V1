
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DragDropUploader from '../DragDropUploader';

interface FileUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId: string;
  creatorName: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  currentFolder: string;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onOpenChange,
  creatorId,
  creatorName,
  onUploadComplete,
  currentFolder
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to {creatorName}'s storage
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <DragDropUploader 
            creatorId={creatorId} 
            onUploadComplete={(fileIds) => {
              onUploadComplete?.(fileIds);
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
            currentFolder={currentFolder}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
