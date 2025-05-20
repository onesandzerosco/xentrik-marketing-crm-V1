
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FolderPlus } from 'lucide-react';

interface EmptyProps {
  label: string;
  description: string;
  onCreateFolder?: () => void;
  onUploadClick?: () => void;
  currentFolder?: string;
  currentCategory?: string | null;
}

export const Empty: React.FC<EmptyProps> = ({
  label,
  description,
  onCreateFolder,
  onUploadClick,
  currentFolder,
  currentCategory
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Upload size={24} className="text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{label}</h3>
      <p className="text-sm text-muted-foreground mt-2 mb-6">{description}</p>
      
      <div className="flex gap-2">
        {onUploadClick && (
          <Button onClick={onUploadClick} variant="default">
            <Upload size={16} className="mr-2" />
            Upload files
          </Button>
        )}
        
        {onCreateFolder && currentFolder === 'all' && (
          <Button onClick={onCreateFolder} variant="outline">
            <FolderPlus size={16} className="mr-2" />
            Create folder
          </Button>
        )}
      </div>
    </div>
  );
};
