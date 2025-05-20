
import React, { useEffect } from 'react';
import { AddTagModal } from './TagModals';
import { CreatorFileType } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';
import { useToast } from '@/hooks/use-toast';

interface AddTagModalWrapperProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedFileIds: string[];
  availableTags: FileTag[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  singleFile: CreatorFileType | null;
  addTagToFiles: (fileIds: string[], tagId: string) => Promise<void>;
}

export const AddTagModalWrapper: React.FC<AddTagModalWrapperProps> = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  availableTags,
  onTagSelect,
  onTagCreate,
  singleFile,
  addTagToFiles
}) => {
  const { toast } = useToast();

  // Handle tag selection with direct integration to addTagToFiles
  const handleTagSelect = async (tagId: string) => {
    const fileIds = singleFile ? [singleFile.id] : selectedFileIds;
    
    try {
      await addTagToFiles(fileIds, tagId);
      toast({
        title: "Tag added",
        description: `Tag added to ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}.`
      });
      // Don't close the modal, allow adding multiple tags
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag to files.",
        variant: "destructive"
      });
    }
  };

  return (
    <AddTagModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedFileIds={singleFile ? [singleFile.id] : selectedFileIds}
      availableTags={availableTags}
      onTagSelect={handleTagSelect}
      onTagCreate={onTagCreate}
      singleFileName={singleFile?.name}
    />
  );
};
