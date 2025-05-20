
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface UploadAreaProps {
  onUploadClick: () => void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ onUploadClick }) => {
  return (
    <div className="fixed bottom-8 right-8">
      <Button 
        onClick={onUploadClick} 
        className="h-14 w-14 rounded-full shadow-lg"
      >
        <Upload size={24} />
        <span className="sr-only">Upload files</span>
      </Button>
    </div>
  );
};
