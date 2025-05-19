
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface FileTag {
  id: string;
  name: string;
  color: string;
}

export const useFileTags = (creatorId?: string) => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch available tags from the database
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('file_tags')
          .select('*');
          
        // Filter by creator if provided
        if (creatorId) {
          query = query.eq('creator', creatorId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw error;
        }
        
        if (data) {
          // Map the database tags to our FileTag interface
          const mappedTags = data.map(tag => ({
            id: tag.id,
            name: tag.tag_name,
            // Assign a default color or extract from tag name
            color: getTagColor(tag.tag_name)
          }));
          
          setAvailableTags(mappedTags);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tags',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTags();
  }, [creatorId, toast]);
  
  // Function to determine a color based on tag name
  const getTagColor = (tagName: string): string => {
    const colors = ['red', 'green', 'blue', 'amber', 'purple', 'pink', 'gray'];
    
    // Simple hash function to get a consistent color for the same tag name
    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
      hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  const addTagToFiles = async (fileIds: string[], tagId: string) => {
    try {
      // Process each file
      for (const fileId of fileIds) {
        const { data: fileData } = await supabase
          .from('media')
          .select('tags')
          .eq('id', fileId)
          .single();
          
        if (fileData) {
          const currentTags = fileData.tags || [];
          if (!currentTags.includes(tagId)) {
            const updatedTags = [...currentTags, tagId];
            
            await supabase
              .from('media')
              .update({ tags: updatedTags })
              .eq('id', fileId);
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Tags added to files',
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding tag to files:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tags to files',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };
  
  const removeTagFromFiles = async (fileIds: string[], tagId: string) => {
    try {
      // Process each file
      for (const fileId of fileIds) {
        const { data: fileData } = await supabase
          .from('media')
          .select('tags')
          .eq('id', fileId)
          .single();
          
        if (fileData) {
          const currentTags = fileData.tags || [];
          if (currentTags.includes(tagId)) {
            const updatedTags = currentTags.filter(id => id !== tagId);
            
            await supabase
              .from('media')
              .update({ tags: updatedTags })
              .eq('id', fileId);
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Tags removed from files',
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing tag from files:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove tags from files',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };
  
  const createTag = async (name: string, color: string = 'gray') => {
    try {
      // Insert the new tag into the database
      const { data, error } = await supabase
        .from('file_tags')
        .insert({
          tag_name: name,
          creator: creatorId || 'system',
          color: color
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create the tag object for our UI
      const newTag = {
        id: data.id,
        name: data.tag_name,
        color: getTagColor(data.tag_name)
      };
      
      // Update our local state
      setAvailableTags(prev => [...prev, newTag]);
      
      toast({
        title: 'Success',
        description: `Tag "${name}" created successfully`,
      });
      
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to create tag',
        variant: 'destructive',
      });
      throw error;
    }
  };
  
  const deleteTag = async (tagId: string) => {
    try {
      // Delete the tag from the database
      const { error } = await supabase
        .from('file_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
      
      // Update our local state
      setAvailableTags(prev => prev.filter(tag => tag.id !== tagId));
      
      toast({
        title: 'Success',
        description: 'Tag deleted successfully',
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        variant: 'destructive',
      });
      return Promise.reject(error);
    }
  };
  
  const filterFilesByTags = (files: CreatorFileType[], tagIds: string[]) => {
    if (tagIds.length === 0) return files;
    
    return files.filter(file => {
      const fileTags = file.tags || [];
      return tagIds.some(tagId => fileTags.includes(tagId));
    });
  };
  
  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags,
    isLoading
  };
};
