
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderPlus, FolderMinus, Trash2 } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileListBatchActionsProps {
  selectedFileIds: string[];
  onAddToFolderClick?: () => void;
  showRemoveFromFolder: boolean;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  currentFolder: string;
  handleRemoveFromFolder: () => void;
  onDeleteFiles?: () => void;
}

export const FileListBatchActions: React.FC<FileListBatchActionsProps> = ({
  selectedFileIds,
  onAddToFolderClick,
  showRemoveFromFolder,
  currentFolder,
  handleRemoveFromFolder,
  onDeleteFiles
}) => {
  const { canManageFolders, canDelete } = useFilePermissions();
  
  if (selectedFileIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg py-2 px-4 z-50 flex gap-2">
      <span className="flex items-center mr-2 text-sm font-medium">
        {selectedFileIds.length} file{selectedFileIds.length !== 1 ? 's' : ''} selected
      </span>
      
      {canManageFolders && (
        <>
          {onAddToFolderClick && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={onAddToFolderClick} 
              className="flex gap-2 items-center"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Add to Folder</span>
            </Button>
          )}
          
          {showRemoveFromFolder && (
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={handleRemoveFromFolder} 
              className="flex gap-2 items-center"
            >
              <FolderMinus className="h-4 w-4" />
              <span>Remove from Folder</span>
            </Button>
          )}
        </>
      )}
      
      {canDelete && onDeleteFiles && (
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={onDeleteFiles} 
          className="flex gap-2 items-center text-red-500 hover:text-red-600 hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Files</span>
        </Button>
      )}
    </div>
  );
};
