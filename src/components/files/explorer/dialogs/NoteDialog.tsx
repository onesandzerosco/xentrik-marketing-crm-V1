
import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { CreatorFileType } from '@/types/fileTypes';

interface NoteDialogProps {
  showEditNoteModal: boolean;
  setShowEditNoteModal: (show: boolean) => void;
  fileToEdit: CreatorFileType | null;
  editedNote: string;
  setEditedNote: (note: string) => void;
  handleUpdateNote: () => void;
}

export const NoteDialog: React.FC<NoteDialogProps> = ({
  showEditNoteModal,
  setShowEditNoteModal,
  fileToEdit,
  editedNote,
  setEditedNote,
  handleUpdateNote
}) => {
  if (!fileToEdit) return null;
  
  return (
    <Dialog open={showEditNoteModal} onOpenChange={(open) => !open && setShowEditNoteModal(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <textarea
            value={editedNote}
            onChange={(e) => setEditedNote(e.target.value)}
            className="w-full h-32 border rounded-md p-2"
            placeholder="Add a note about this file..."
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowEditNoteModal(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateNote}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
