
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreatorFileType } from '@/types/fileTypes';

interface EditNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  file: CreatorFileType | null; // Changed to match expected prop type
  note: string;
  setNote: (note: string) => void;
  onSave: () => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onOpenChange,
  file,
  note,
  setNote,
  onSave,
}) => {
  if (!file) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Note for {file.name}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Add a note about this file..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
