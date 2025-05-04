
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus } from 'lucide-react';

interface FileHeaderProps {
  creatorName: string;
  onUploadClick?: () => void;
  isCreatorView?: boolean;
  selectedFiles?: number;
  onAddToFolderClick?: () => void;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ 
  creatorName, 
  isCreatorView = false,
  selectedFiles = 0,
  onAddToFolderClick
}) => {
  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{creatorName}'s Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize files
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedFiles > 0 && onAddToFolderClick && (
            <Button variant="outline" onClick={onAddToFolderClick}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add {selectedFiles} Files to Folder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
