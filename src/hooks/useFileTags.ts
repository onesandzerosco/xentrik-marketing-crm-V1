
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreatorFileType } from '@/types/fileTypes';

export interface FileTag {
  id: string;
  name: string;
}

export const useFileTags = () => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('file_tags').select('*');
      if (error) throw error;
      setAvailableTags(data.map(tag => ({ id: tag.id, name: tag.name })));
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      toast({
        title: 'Error fetching tags',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string): Promise<FileTag | null> => {
    try {
      // Check if tag already exists
      const existingTag = availableTags.find(tag => 
        tag.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingTag) {
        return existingTag;
      }
      
      // Create new tag
      const { data, error } = await supabase
        .from('file_tags')
        .insert({ name })
        .select()
        .single();
      
      if (error) throw error;
      
      const newTag = { id: data.id, name: data.name };
      setAvailableTags(prev => [...prev, newTag]);
      return newTag;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error creating tag',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const filterFilesByTags = (files: CreatorFileType[], tagIds: string[]): CreatorFileType[] => {
    if (tagIds.length === 0) return files;
    
    return files.filter(file => {
      if (!file.tags) return false;
      return tagIds.some(tagId => file.tags?.includes(tagId));
    });
  };

  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    createTag,
    filterFilesByTags
  };
};
