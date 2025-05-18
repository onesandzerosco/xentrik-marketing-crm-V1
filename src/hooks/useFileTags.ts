
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreatorFileType } from '@/types/fileTypes';

export interface FileTag {
  id: string;
  name: string;
  color?: string;
}

export const useFileTags = () => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if the file_tags table exists first
      const { data: existingTables, error: tablesError } = await supabase
        .from('media')
        .select('tags')
        .limit(1);
      
      if (tablesError) {
        console.error('Error checking tags:', tablesError);
        setAvailableTags([]);
        return;
      }

      // For now, we can't fetch from file_tags table as it doesn't exist
      // Instead, collect unique tags from media table
      const { data: mediaWithTags, error: mediaError } = await supabase
        .from('media')
        .select('tags')
        .not('tags', 'is', null);

      if (mediaError) throw mediaError;

      // Extract unique tags from media records
      const uniqueTags = new Set<string>();
      mediaWithTags?.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => uniqueTags.add(tag));
        }
      });

      // Convert to FileTag objects
      const tagObjects = Array.from(uniqueTags).map(id => ({ 
        id, 
        name: id, // Use tag ID as name for now
        color: 'gray' // Default color
      }));
      
      setAvailableTags(tagObjects);
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
      
      // For now, since there is no tag table, we'll create a tag locally
      const newTag = { id: name, name, color: 'gray' };
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
