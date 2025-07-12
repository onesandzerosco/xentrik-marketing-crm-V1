
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus, FolderMinus, Trash2 } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  // Show remove from folder button only in custom folders (not in 'all' or 'unsorted')
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';
  
  // Don't show anything if no files are selected or not in creator view
  if (selectedFileIds.length === 0 || !isCreatorView) {
    return null;
  }
  
  return (
    <div className={`col-span-full flex items-center ${isMobile ? 'flex-wrap gap-1 mb-2' : 'gap-2 mb-4'}`}>
      {canManageFolders && (
        <>
          {onAddToFolderClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToFolderClick}
              className={isMobile ? 'text-xs px-2 py-1 h-auto' : ''}
            >
              <FolderPlus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? `Add ${selectedFileIds.length}` : `Add ${selectedFileIds.length} Files to Folder`}
            </Button>
          )}
          
          {showRemoveFromFolder && onRemoveFromFolderClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveFromFolderClick}
              className={isMobile ? 'text-xs px-2 py-1 h-auto' : ''}
            >
              <FolderMinus className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
              {isMobile ? `Remove ${selectedFileIds.length}` : `Remove ${selectedFileIds.length} Files from Folder`}
            </Button>
          )}
        </>
      )}
      
      {canDelete && onDeleteFilesClick && (
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteFilesClick}
          className={`text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-600 ${
            isMobile ? 'text-xs px-2 py-1 h-auto' : ''
          }`}
        >
          <Trash2 className={`${isMobile ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          {isMobile ? `Delete ${selectedFileIds.length}` : `Delete ${selectedFileIds.length} Files`}
        </Button>
      )}
    </div>
  );
};
