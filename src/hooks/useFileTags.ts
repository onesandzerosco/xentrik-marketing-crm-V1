
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { CreatorFileType, FileTag } from '@/types/fileTypes';

export const useFileTags = () => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if the media table exists
      const { data: existingTables, error: tablesError } = await supabase
        .from('media')
        .select('id')
        .limit(1);
      
      if (tablesError) {
        console.error('Error checking media table:', tablesError);
        setAvailableTags([]);
        return;
      }

      // Since tags column might not exist yet, we'll handle the error gracefully
      // and provide a fallback of empty tags
      const { data: mediaWithTags, error: mediaError } = await supabase
        .from('media')
        .select('*');

      if (mediaError) {
        // If there's an error related to the tags column not existing
        console.error('Error fetching tags:', mediaError);
        setAvailableTags([]);
        return;
      }

      // Extract unique tags from media records if they exist
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
      console.error('Error in fetchTags:', error);
      setAvailableTags([]);
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
