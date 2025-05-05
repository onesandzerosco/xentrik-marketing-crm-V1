
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CreatorFileType } from '@/pages/CreatorFiles';

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
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit File Description</DialogTitle>
          <DialogDescription>
            Update the description for {editingFile?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="fileDescription">Description</Label>
          <Textarea 
            id="fileDescription" 
            value={editingNote} 
            onChange={(e) => setEditingNote(e.target.value)}
            placeholder="Add a description for this file..."
            className="mt-2"
            rows={4}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Save Description
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
