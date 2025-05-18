
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CreatorFileType } from '@/types/fileTypes';
import { useToast } from '@/components/ui/use-toast';

export interface FileTag {
  id: string;
  name: string;
  color?: string;
}

export function useFileTags() {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch available tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('file_tags')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const formattedTags = data.map((tag: any) => ({
          id: tag.id,
          name: tag.name,
          color: tag.color
        }));
        
        setAvailableTags(formattedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, []);
  
  // Create a new tag
  const createTag = async (name: string): Promise<FileTag | null> => {
    if (!name.trim()) {
      toast({
        title: 'Tag name required',
        description: 'Please enter a tag name',
        variant: 'destructive',
      });
      return null;
    }
    
    try {
      // Check if tag already exists with case-insensitive comparison
      const existingTag = availableTags.find(
        tag => tag.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingTag) {
        toast({
          title: 'Tag already exists',
          description: `The tag "${name}" already exists`,
        });
        return existingTag;
      }
      
      const color = generateRandomColorHex();
      
      // Insert the new tag
      const { data, error } = await supabase
        .from('file_tags')
        .insert({ name, color })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Format the new tag
      const newTag: FileTag = {
        id: data.id,
        name: data.name,
        color: data.color
      };
      
      // Update the local state
      setAvailableTags([...availableTags, newTag]);
      
      toast({
        title: 'Tag created',
        description: `Created tag "${name}"`,
      });
      
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  // Filter files by selected tags
  const filterFilesByTags = (files: CreatorFileType[], tagIds: string[]): CreatorFileType[] => {
    if (tagIds.length === 0) {
      return files;
    }
    
    return files.filter(file => {
      if (!file.tags || file.tags.length === 0) {
        return false;
      }
      
      return tagIds.some(tagId => file.tags.includes(tagId));
    });
  };
  
  // Generate a random color for tags
  const generateRandomColorHex = (): string => {
    // Generate pastel colors for better visibility
    const baseColors = [
      '#FFD1DC', // Pink
      '#FFB347', // Orange
      '#FFDF80', // Yellow
      '#98FB98', // Green
      '#87CEFA', // Blue
      '#D8BFD8', // Purple
      '#FFA07A', // Coral
      '#B0E0E6', // Powder Blue
    ];
    
    return baseColors[Math.floor(Math.random() * baseColors.length)];
  };

  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    createTag,
    filterFilesByTags
  };
}
