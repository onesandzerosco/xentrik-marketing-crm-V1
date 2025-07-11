
import React, { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileListItem } from './list/FileListItem';
import { useFileSelection } from './explorer/hooks/useFileSelection';
import { ConfirmDeleteModal } from './modals/ConfirmDeleteModal';

interface FileListProps {
  files: CreatorFileType[];
  isCreatorView: boolean;
  onFileDeleted?: (fileId: string) => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  availableFolders?: Array<{ id: string; name: string; categoryId: string }>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTagClick?: () => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
  viewMode?: 'grid' | 'list';
}

export const FileList: React.FC<FileListProps> = ({
  files,
  isCreatorView,
  onFileDeleted = () => {},
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  availableFolders = [],
  onRemoveFromFolder,
  onEditNote,
  onAddTagClick,
  onAddTagToFile
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CreatorFileType | null>(null);
  
  const {
    selectedFileIds,
    setSelectedFileIds,
    isFileSelected,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
  } = useFileSelection();

  // Placeholder function for file clicks (used for viewing/previewing)
  const handleFileClick = (file: CreatorFileType) => {
    // This is a placeholder function that can be implemented later
    console.log('File clicked:', file.name);
  };
  
  // Logic for showing remove from folder option
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';

  // Handle delete confirmation
  const handleDeleteConfirm = (file: CreatorFileType) => {
    setFileToDelete(file);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      onFileDeleted(fileToDelete.id);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              {isCreatorView && (
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={selectedFileIds.length === files.length && files.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      selectAllFiles(files.map(file => file.id));
                    } else {
                      clearSelection();
                    }
                  }}
                />
              )}
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <FileListItem
              key={file.id}
              file={file}
              isCreatorView={isCreatorView}
              isFileSelected={isFileSelected}
              toggleFileSelection={toggleFileSelection}
              handleFileClick={handleFileClick}
              handleDeleteFile={() => handleDeleteConfirm(file)}
              showRemoveFromFolder={showRemoveFromFolder}
              onRemoveFromFolder={onRemoveFromFolder}
              currentFolder={currentFolder}
              onEditNote={onEditNote}
              onFileDeleted={onFileDeleted}
              onFilesChanged={() => {}}
              onAddTagToFile={onAddTagToFile ? () => onAddTagToFile(file) : undefined}
            />
          ))}
        </TableBody>
      </Table>

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
