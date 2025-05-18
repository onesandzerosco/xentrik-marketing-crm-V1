
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
      // Fetch tags from the file_tags table
      const { data: tagData, error: tagError } = await supabase
        .from('file_tags')
        .select('id, tag_name');
      
      if (tagError) {
        console.error('Error fetching tags from file_tags table:', tagError);
        // Fallback to collecting unique tags from media table
        const { data: mediaWithTags, error: mediaError } = await supabase
          .from('media')
          .select('tags');
        
        if (mediaError) {
          console.error('Error fetching tags from media:', mediaError);
          setAvailableTags([]);
          return;
        }

        // Extract unique tags
        const uniqueTags = new Set<string>();
        mediaWithTags?.forEach(item => {
          if (item.tags && Array.isArray(item.tags)) {
            item.tags.forEach((tag: string) => uniqueTags.add(tag));
          }
        });

        // Convert to FileTag objects
        const tagObjects = Array.from(uniqueTags).map(id => ({ 
          id, 
          name: id, 
          color: 'gray' 
        }));
        
        setAvailableTags(tagObjects);
      } else {
        // Convert the file_tags data to our FileTag format
        const tags = tagData?.map(tag => ({
          id: tag.tag_name, // Use tag_name as id for easier reference
          name: tag.tag_name,
          color: 'gray' // Default color
        })) || [];
        
        setAvailableTags(tags);
      }
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
      
      // Create a new tag in the file_tags table
      const { data, error } = await supabase
        .from('file_tags')
        .insert({
          tag_name: name,
          creator: 'system' // Default value, ideally would be current user id
        })
        .select();
      
      if (error) throw error;
      
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
