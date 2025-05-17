
import React from 'react';
import { EditNoteModal } from '../EditNoteModal';
import { CreatorFileType } from '@/types/fileTypes';

interface NoteModalsProps {
  isEditNoteModalOpen: boolean;
  setIsEditNoteModalOpen: (open: boolean) => void;
  editingFile: CreatorFileType | null;
  editingNote: string;
  setEditingNote: (note: string) => void;
  handleSaveNote: (note: string) => void;
}

export const NoteModals: React.FC<NoteModalsProps> = ({
  isEditNoteModalOpen,
  setIsEditNoteModalOpen,
  editingFile,
  editingNote,
  setEditingNote,
  handleSaveNote,
}) => {
  // Function to handle saving notes
  const onSaveNote = () => {
    handleSaveNote(editingNote);
  };

  return (
    <EditNoteModal
      isOpen={isEditNoteModalOpen}
      onOpenChange={setIsEditNoteModalOpen}
      file={editingFile}
      note={editingNote}
      setNote={setEditingNote}
      onSave={onSaveNote}
    />
  );
};
