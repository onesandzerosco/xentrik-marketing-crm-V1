
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderMinus } from 'lucide-react';

interface FileListBatchActionsProps {
  selectedFileIds: string[];
  onAddToFolderClick?: () => void;
  showRemoveFromFolder: boolean;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  handleRemoveFromFolder?: () => void;
  currentFolder: string;
  canManageFolders?: boolean; // New prop to check permissions
}

export const FileListBatchActions: React.FC<FileListBatchActionsProps> = ({
  selectedFileIds,
  onAddToFolderClick,
  showRemoveFromFolder,
  handleRemoveFromFolder,
  currentFolder,
  canManageFolders = false // Default to false for safety
}) => {
  if (selectedFileIds.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 mb-2 p-2 bg-background border rounded-md shadow flex items-center justify-between">
      <div className="text-sm">
        {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'} selected
      </div>
      <div className="flex items-center gap-2">
        {/* Add to folder button */}
        {onAddToFolderClick && canManageFolders && (
          <Button
            size="sm"
            variant="outline"
            onClick={onAddToFolderClick}
            className="flex items-center gap-1"
          >
            <FolderPlus className="h-4 w-4 mr-1" />
            Add to Folder
          </Button>
        )}
        
        {/* Remove from folder button */}
        {showRemoveFromFolder && handleRemoveFromFolder && canManageFolders && currentFolder !== 'all' && currentFolder !== 'unsorted' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveFromFolder}
            className="flex items-center gap-1"
          >
            <FolderMinus className="h-4 w-4 mr-1" />
            Remove from Folder
          </Button>
        )}
      </div>
    </div>
  );
};
