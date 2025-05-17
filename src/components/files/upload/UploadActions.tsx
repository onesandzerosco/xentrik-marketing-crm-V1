
import React from 'react';
import { Button } from '@/components/ui/button';

interface UploadActionsProps {
  onCancel: () => void;
  onComplete: () => void;
  isUploading: boolean;
}

export const UploadActions: React.FC<UploadActionsProps> = ({
  onCancel,
  onComplete,
  isUploading
}) => {
  return (
    <div className="flex justify-between pt-4 border-t mt-2">
      <Button 
        variant="outline" 
        onClick={onCancel}
        disabled={isUploading}
      >
        Cancel
      </Button>
      <Button 
        variant="default" 
        onClick={onComplete}
        disabled={isUploading}
      >
        Done
      </Button>
    </div>
  );
};
