
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useFileTags = (creatorId: string, onRefresh: () => void) => {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [fileToTag, setFileToTag] = useState<CreatorFileType | null>(null);
  const [selectedFileTag, setSelectedFileTag] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Add handler function for adding tags
  const handleAddTag = (file: CreatorFileType) => {
    setFileToTag(file);
    setSelectedFileTag('');
    setShowTagDialog(true);
  };

  // Add handler function for saving tags
  const handleSaveTag = async () => {
    if (!fileToTag || !selectedFileTag) return;
    
    try {
      // Get current tags or empty array
      const currentTags = fileToTag.tags || [];
      
      // Check if tag already exists
      if (currentTags.includes(selectedFileTag)) {
        toast({
          title: 'Tag already exists',
          description: 'This file already has this tag.',
        });
        return;
      }
      
      // Add the new tag
      const updatedTags = [...currentTags, selectedFileTag];
      
      // Update the file in Supabase
      const { error } = await supabase
        .from('media')
        .update({ tags: updatedTags })
        .eq('id', fileToTag.id);
      
      if (error) throw error;
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.map((file: CreatorFileType) =>
          file.id === fileToTag.id ? { ...file, tags: updatedTags } : file
        );
        
        return updatedFiles;
      });
      
      // Close dialog and refresh
      setShowTagDialog(false);
      setFileToTag(null);
      toast({
        title: 'Tag Added',
        description: 'File tag added successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Handle tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedFileTag(tagId);
  };

  return {
    showTagDialog,
    setShowTagDialog,
    fileToTag,
    selectedFileTag,
    handleAddTag,
    handleSaveTag,
    handleTagSelect
  };
};
