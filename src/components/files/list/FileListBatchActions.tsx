
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderMinus } from 'lucide-react';

interface FileListBatchActionsProps {
  selectedFileIds: string[];
  onAddToFolderClick?: () => void;
  showRemoveFromFolder: boolean;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  currentFolder: string;
  handleRemoveFromFolder: () => void;
}

export const FileListBatchActions: React.FC<FileListBatchActionsProps> = ({
  selectedFileIds,
  onAddToFolderClick,
  showRemoveFromFolder,
  handleRemoveFromFolder
}) => {
  if (selectedFileIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      {onAddToFolderClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddToFolderClick}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add {selectedFileIds.length} Files to Folder
        </Button>
      )}
      
      {showRemoveFromFolder && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemoveFromFolder}
        >
          <FolderMinus className="h-4 w-4 mr-2" />
          Remove {selectedFileIds.length} Files from Folder
        </Button>
      )}
    </div>
  );
};
