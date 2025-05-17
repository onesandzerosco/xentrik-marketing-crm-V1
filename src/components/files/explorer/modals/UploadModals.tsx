
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FileUploadModal } from '../FileUploadModal';

interface UploadModalsProps {
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  creatorId?: string;
  onFilesChanged?: () => void;
  onUploadComplete?: (fileIds: string[]) => void;
}

export const UploadModals: React.FC<UploadModalsProps> = ({
  isUploadModalOpen,
  setIsUploadModalOpen,
  creatorId,
  onFilesChanged,
  onUploadComplete
}) => {
  return (
    <>
      {/* File Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <FileUploadModal 
            creatorId={creatorId || ''}
            onClose={() => setIsUploadModalOpen(false)}
            onFilesChanged={onFilesChanged}
            onUploadComplete={onUploadComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
