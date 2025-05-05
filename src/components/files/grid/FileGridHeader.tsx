
import React from 'react';
import { Button } from "@/components/ui/button";
import { FolderPlus } from 'lucide-react';
import { useFilePermissions } from '@/utils/permissionUtils';

interface FileGridHeaderProps {
  selectedFileIds: string[];
  isCreatorView: boolean;
  onAddToFolderClick?: () => void;
}

export const FileGridHeader: React.FC<FileGridHeaderProps> = ({
  selectedFileIds,
  isCreatorView,
  onAddToFolderClick,
}) => {
  const { canManageFolders } = useFilePermissions();
  
  // Don't show anything if no files are selected or not in creator view
  if (selectedFileIds.length === 0 || !isCreatorView) {
    return null;
  }
  
  return (
    <div className="col-span-full flex items-center gap-2 mb-4">
      {onAddToFolderClick && canManageFolders && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddToFolderClick}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Add {selectedFileIds.length} Files to Folder
        </Button>
      )}
    </div>
  );
};
