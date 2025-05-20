
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreatorFileType } from '@/types/fileTypes';

interface NoteEditModalProps {
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  handleSaveNote: () => void;
}

export const NoteEditModal: React.FC<NoteEditModalProps> = ({
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  editingFile,
  editingNote,
  setEditingNote,
  handleSaveNote
}) => {
  if (!editingFile) return null;
  
  return (
    <Dialog open={isEditNoteModalOpen} onOpenChange={setIsEditNoteModalOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Add or edit the note for {editingFile.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="note">Note</Label>
          <Input 
            id="note"
            value={editingNote || ''}
            onChange={(e) => setEditingNote(e.target.value)}
            placeholder="Add a note about this file..."
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditNoteModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveNote}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
