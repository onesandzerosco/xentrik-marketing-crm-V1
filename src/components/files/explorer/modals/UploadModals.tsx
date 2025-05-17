
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FileUploadModal } from '../FileUploadModal';

interface UploadModalsProps {
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  creatorId?: string;
  creatorName?: string;
  onFilesChanged?: () => void;
  onUploadComplete?: (fileIds: string[]) => void;
}

export const UploadModals: React.FC<UploadModalsProps> = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  creatorId,
  creatorName,
  onFilesChanged,
  onUploadComplete
}) => {
  return (
    <>
      {/* File Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <FileUploadModal 
            isOpen={isUploadModalOpen}
            onOpenChange={setIsUploadModalOpen}
            creatorId={creatorId || ''}
            creatorName={creatorName || ''}
            onFilesChanged={onFilesChanged}
            onUploadComplete={onUploadComplete}
            currentFolder=""
            availableCategories={[]}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
