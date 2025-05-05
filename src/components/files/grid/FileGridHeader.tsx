
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderMinus } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileGridHeaderProps {
  selectedFileIds: string[];
  isCreatorView?: boolean;
  onAddToFolderClick?: () => void;
  showRemoveFromFolder?: boolean;
  onRemoveFromFolder?: () => void;
  currentFolder?: string;
}

export const FileGridHeader: React.FC<FileGridHeaderProps> = ({
  selectedFileIds,
  isCreatorView = false,
  onAddToFolderClick,
  showRemoveFromFolder = false,
  onRemoveFromFolder,
  currentFolder = 'all'
}) => {
  const { canManageFolders } = useFilePermissions();

  if (selectedFileIds.length === 0) {
    return null;
  }

  return (
    <div className="col-span-full p-2 mb-2 bg-background border rounded-md shadow flex items-center justify-between">
      <div className="text-sm">
        {selectedFileIds.length} {selectedFileIds.length === 1 ? 'file' : 'files'} selected
      </div>
      
      <div className="flex items-center gap-2">
        {/* Add to folder button */}
        {onAddToFolderClick && isCreatorView && canManageFolders && (
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
        {showRemoveFromFolder && onRemoveFromFolder && isCreatorView && canManageFolders && 
         currentFolder && currentFolder !== 'all' && currentFolder !== 'unsorted' && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRemoveFromFolder}
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
