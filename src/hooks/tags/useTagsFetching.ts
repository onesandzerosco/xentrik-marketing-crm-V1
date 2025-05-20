
import { useState, useEffect } from 'react';
import { FileTag, UseFileTagsProps } from './types';
import { supabase } from '@/integrations/supabase/client';
import { getTagColor } from './tagUtils';

export const useTagsFetching = ({ creatorId }: UseFileTagsProps = {}) => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch tags from the database, filtered by creator if specified
  const fetchTags = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('file_tags')
        .select('id, tag_name, creator');
      
      // If a creator ID is provided, filter tags by that creator
      if (creatorId) {
        query = query.eq('creator', creatorId);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching tags:', error);
        return;
      }
      
      if (!data) {
        console.log('No tags found');
        setAvailableTags([]);
        return;
      }
      
      // Transform the database tags to our FileTag interface
      const formattedTags = data.map(tag => ({
        id: tag.id,
        name: tag.tag_name,
        color: getTagColor(tag.tag_name) // Assign a color based on the tag name
      }));
      
      setAvailableTags(formattedTags);
    } catch (error) {
      console.error('Error in fetchTags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTags();
  }, [creatorId]); // Re-fetch tags when creator ID changes
  
  return {
    availableTags,
    setAvailableTags,
    isLoading,
    fetchTags
  };
};
