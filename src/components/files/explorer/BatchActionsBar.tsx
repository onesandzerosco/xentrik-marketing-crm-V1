
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Trash2, X } from 'lucide-react';
import { CreatorFileType } from '@/types/fileTypes';
import { useBatchFileOperations } from '@/hooks/useBatchFileOperations';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface BatchActionsBarProps {
  selectedFileIds: string[];
  files: CreatorFileType[];
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
  onClearSelection: () => void;
  isCreatorView: boolean;
}

export const BatchActionsBar: React.FC<BatchActionsBarProps> = ({
  selectedFileIds,
  files,
  onFilesChanged,
  onFileDeleted,
  onClearSelection,
  isCreatorView
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  
  const {
    downloadSelectedFiles,
    deleteSelectedFiles,
    isProcessing
  } = useBatchFileOperations({
    onFilesChanged,
    onFileDeleted
  });

  if (selectedFileIds.length === 0) return null;

  const handleDownload = () => {
    downloadSelectedFiles(files, selectedFileIds);
  };

  const handleDeleteConfirm = () => {
    deleteSelectedFiles(files, selectedFileIds);
    setShowDeleteConfirm(false);
    onClearSelection();
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg py-3 px-6 z-50 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedFileIds.length} file{selectedFileIds.length !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          
          {isCreatorView && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="flex items-center gap-2 text-destructive border-destructive/50 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="ghost"
            onClick={onClearSelection}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Delete Selected Files"
        description={`Are you sure you want to delete ${selectedFileIds.length} selected file${selectedFileIds.length !== 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete Files"
        isProcessing={isProcessing}
      />
    </>
  );
};
