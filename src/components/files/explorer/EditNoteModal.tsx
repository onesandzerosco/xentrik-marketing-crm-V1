
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreatorFileType } from '@/types/fileTypes';

interface EditNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  onSave: () => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onOpenChange,
  editingFile,
  editingNote,
  setEditingNote,
  onSave,
}) => {
  if (!editingFile) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Note for {editingFile.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Add a note about this file..."
            value={editingNote}
            onChange={(e) => setEditingNote(e.target.value)}
            className="min-h-[150px]"
            autoFocus
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
