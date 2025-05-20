
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  creatorId: string;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  currentFolder: string;
  currentCategory: string | null;
}

export const UploadButton: React.FC<UploadButtonProps> = ({ 
  creatorId, 
  onUploadComplete, 
  onUploadStart, 
  currentFolder,
  currentCategory
}) => {
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    // Upload functionality will be handled by the modal that opens
  };

  return (
    <Button onClick={handleUploadClick} className="flex items-center gap-2">
      <Upload size={16} />
      Upload Files
    </Button>
  );
};
