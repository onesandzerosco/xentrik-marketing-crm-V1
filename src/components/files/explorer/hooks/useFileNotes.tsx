
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export const useFileNotes = ({ onRefresh }: { onRefresh: () => void }) => {
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CreatorFileType | null>(null);
  const [editingNote, setEditingNote] = useState('');
  const { toast } = useToast();
  
  // Handler for note editing
  const handleEditNote = (file: CreatorFileType) => {
    setEditingFile(file);
    setEditingNote(file.description || '');
    setIsEditNoteModalOpen(true);
  };
  
  // Save the edited note
  const handleSaveNote = async () => {
    if (!editingFile) return;
    
    try {
      // Update the file's description in the database
      const { error } = await supabase
        .from('media')
        .update({ description: editingNote })
        .eq('id', editingFile.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Note updated",
        description: "File description has been updated successfully.",
      });
      
      // Close the modal and refresh the files list
      setIsEditNoteModalOpen(false);
      setEditingFile(null);
      setEditingNote('');
      onRefresh();
      
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error updating note",
        description: "An error occurred while updating the file description.",
        variant: "destructive"
      });
    }
  };

  return {
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    setEditingFile,
    editingNote, 
    setEditingNote,
    handleEditNote,
    handleSaveNote
  };
};
