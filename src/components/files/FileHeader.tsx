
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FolderInput } from 'lucide-react';

interface FileHeaderProps {
  creatorName: string;
  onUploadClick?: () => void;
  isCreatorView?: boolean;
  selectedFiles?: number;
  onMoveFilesClick?: () => void;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ 
  creatorName, 
  onUploadClick, 
  isCreatorView = false,
  selectedFiles = 0,
  onMoveFilesClick
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
          {selectedFiles > 0 && onMoveFilesClick && (
            <Button variant="outline" onClick={onMoveFilesClick}>
              <FolderInput className="h-4 w-4 mr-2" />
              Move {selectedFiles} Files
            </Button>
          )}
          
          {isCreatorView && onUploadClick && (
            <Button onClick={onUploadClick}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
