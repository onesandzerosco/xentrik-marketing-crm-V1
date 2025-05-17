
import React from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyFoldersStateProps {
  onCreateFolder: () => void;
}

export const EmptyFoldersState: React.FC<EmptyFoldersStateProps> = ({ onCreateFolder }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FolderPlus className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No folders yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        This category doesn't have any folders. Create one to organize your files.
      </p>
      <Button 
        onClick={onCreateFolder}
        variant="outline" 
        className="mt-4"
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        Create folder
      </Button>
    </div>
  );
};
