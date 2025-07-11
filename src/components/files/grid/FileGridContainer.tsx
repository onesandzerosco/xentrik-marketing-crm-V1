
import React, { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useFilePermissions } from '@/utils/permissionUtils';
import { FileCard } from './FileCard';
import { FileSelection } from './FileSelection';
import { useFileGrid } from './useFileGrid';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';

interface FileGridContainerProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
  recentlyUploadedIds: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
  currentFolder: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const FileGridContainer: React.FC<FileGridContainerProps> = ({
  files,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  recentlyUploadedIds,
  onSelectFiles,
  onEditNote,
  onAddTagToFile,
  currentFolder,
  onRemoveFromFolder
}) => {
  const { canDelete, canEdit, canManageFolders } = useFilePermissions();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CreatorFileType | null>(null);
  
  const {
    isFileSelected,
    toggleFileSelection,
    isFileDeleting,
    isFileRemovingFromFolder,
    showRemoveFromFolder,
    handleDeleteFile,
    handleRemoveFromFolder
  } = useFileGrid({
    files,
    onFilesChanged,
    onFileDeleted,
    onSelectFiles,
    currentFolder,
    onRemoveFromFolder
  });

  // Handle file click (placeholder function)
  const handleFileClick = (file: CreatorFileType) => {
    // This is just a stub to satisfy the interface - we have dedicated action buttons now
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (file: CreatorFileType) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await handleDeleteFile(fileToDelete.id, canDelete);
      setShowDeleteConfirm(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setFileToDelete(null);
  };

  return (
    <>
      {files.map((file) => {
        const isNew = recentlyUploadedIds?.includes(file.id);
        const isDeleting = isFileDeleting(file.id);
        const isRemoving = isFileRemovingFromFolder(file.id);
        const isSelected = isFileSelected(file.id);

        // Skip rendering files being deleted or removed from folder when in folder view
        if (isDeleting || (isRemoving && currentFolder !== 'all' && currentFolder !== 'unsorted')) return null;

        return (
          <div key={file.id} className="relative">
            {isCreatorView && (
              <FileSelection 
                fileId={file.id}
                isSelected={isSelected}
                onToggleSelection={toggleFileSelection}
              />
            )}
            
            <FileCard
              file={file}
              isCreatorView={isCreatorView}
              onFileClick={handleFileClick}
              onDeleteFile={() => handleDeleteConfirm(file)}
              onEditNote={onEditNote}
              onAddTagToFile={onAddTagToFile}
              onRemoveFromFolder={() => handleRemoveFromFolder(file.id)}
              isDeleting={isDeleting}
              isRemoving={isRemoving}
              isSelected={isSelected}
              isNew={isNew}
              showRemoveFromFolder={showRemoveFromFolder}
              canDelete={canDelete}
              canEdit={canEdit}
            />
          </div>
        );
      })}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete File"
      />
    </>
  );
};
