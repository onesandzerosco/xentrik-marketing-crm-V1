
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import TagSelector from '@/components/files/TagSelector';
import { CreatorFileType } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';

interface TagDialogProps {
  showTagDialog: boolean;
  setShowTagDialog: (show: boolean) => void;
  fileToTag: CreatorFileType | null;
  selectedFileTag: string;
  handleTagSelect: (tagId: string) => void;
  handleSaveTag: () => void;
  availableTags: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
}

export const TagDialog: React.FC<TagDialogProps> = ({
  showTagDialog,
  setShowTagDialog,
  fileToTag,
  selectedFileTag,
  handleTagSelect,
  handleSaveTag,
  availableTags,
  onTagCreate
}) => {
  return (
    <Dialog open={showTagDialog} onOpenChange={(open) => !open && setShowTagDialog(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag to File</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            {fileToTag && `Select a tag to add to "${fileToTag.filename || fileToTag.name}"`}
          </p>
          <TagSelector
            tags={availableTags || []}
            selectedTags={[selectedFileTag]}
            onTagSelect={handleTagSelect}
            onTagCreate={onTagCreate}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowTagDialog(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveTag}
            disabled={!selectedFileTag}
          >
            Add Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
