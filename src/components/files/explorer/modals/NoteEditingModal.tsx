
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NoteEditingModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  onSave: () => void;
}

export const NoteEditingModal: React.FC<NoteEditingModalProps> = ({
  isOpen,
  setIsOpen,
  editingFile,
  editingNote,
  setEditingNote,
  onSave
}) => {
  if (!editingFile) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
