import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Creator } from '@/context/creator/types';
import { CreatorProfileState } from './types';

export const useProfileSave = (creator: Creator | null) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async (
    state: CreatorProfileState, 
    setNameError: (error: string) => void
  ) => {
    if (!creator) {
      toast({
        title: 'Error',
        description: 'Creator not found.',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!state.name.trim()) {
      setNameError('Name is required');
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Placeholder for actual save logic
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Creator profile updated successfully.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update creator profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return { handleSave, isSaving };
};
