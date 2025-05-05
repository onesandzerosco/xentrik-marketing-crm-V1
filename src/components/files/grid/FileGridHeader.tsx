
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderMinus, Trash2 } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileGridHeaderProps {
  selectedFileIds: string[];
  isCreatorView: boolean;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolderClick?: () => void;
  onDeleteFilesClick?: () => void;
}

export const FileGridHeader: React.FC<FileGridHeaderProps> = ({
  selectedFileIds,
  isCreatorView,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolderClick,
  onDeleteFilesClick,
}) => {
  const { canManageFolders, canDelete } = useFilePermissions();
  
  // Show remove from folder button only in custom folders (not in 'all' or 'unsorted')
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';
  
  // Don't show anything if no files are selected or not in creator view
  if (selectedFileIds.length === 0 || !isCreatorView) {
    return null;
  }
  
  return (
    <div className="col-span-full flex items-center gap-2 mb-4">
      {canManageFolders && (
        <>
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
          
          {showRemoveFromFolder && onRemoveFromFolderClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveFromFolderClick}
            >
              <FolderMinus className="h-4 w-4 mr-2" />
              Remove {selectedFileIds.length} Files from Folder
            </Button>
          )}
        </>
      )}
      
      {canDelete && onDeleteFilesClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteFilesClick}
          className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete {selectedFileIds.length} Files
        </Button>
      )}
    </div>
  );
};
