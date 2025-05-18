
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CreatorFileType } from '@/types/fileTypes';

export const useFileNotesDialog = (creatorId: string, onRefresh: () => void) => {
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<CreatorFileType | null>(null);
  const [editedNote, setEditedNote] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // File description handlers
  const handleEditNote = (file: CreatorFileType) => {
    setFileToEdit(file);
    setEditedNote(file.description || '');
    setShowEditNoteModal(true);
  };
  
  const handleUpdateNote = async () => {
    if (!fileToEdit) return;
    
    try {
      const { error } = await supabase
        .from('media')
        .update({ description: editedNote })
        .eq('id', fileToEdit.id);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.map((file: CreatorFileType) =>
          file.id === fileToEdit.id ? { ...file, description: editedNote } : file
        );
        
        return updatedFiles;
      });
      
      setFileToEdit(null);
      setShowEditNoteModal(false);
      toast({
        title: 'Note Updated',
        description: 'File note updated successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    showEditNoteModal,
    setShowEditNoteModal,
    fileToEdit,
    editedNote,
    setEditedNote,
    handleEditNote,
    handleUpdateNote
  };
};
