
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';

export interface FileTag {
  id: string;
  name: string;
  color: string;
}

interface UseFileTagsProps {
  creatorId?: string;
}

export const useFileTags = ({ creatorId }: UseFileTagsProps = {}) => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
  
  // Simple function to assign colors based on tag name
  const getTagColor = (tagName: string): string => {
    const colors = ['red', 'green', 'blue', 'purple', 'pink', 'amber', 'gray'];
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  // Function to add a tag to files
  const addTagToFiles = async (fileIds: string[], tagId: string) => {
    if (!fileIds.length || !tagId) return Promise.resolve();
    
    try {
      // Process each file
      for (const fileId of fileIds) {
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('tags')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching file data:', fetchError);
          continue;
        }
          
        if (fileData) {
          const currentTags = fileData.tags || [];
          if (!currentTags.includes(tagId)) {
            const updatedTags = [...currentTags, tagId];
            
            const { error: updateError } = await supabase
              .from('media')
              .update({ tags: updatedTags })
              .eq('id', fileId);
              
            if (updateError) {
              console.error('Error updating file tags:', updateError);
            }
          }
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding tag to files:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to remove a tag from files
  const removeTagFromFiles = async (fileIds: string[], tagId: string) => {
    if (!fileIds.length || !tagId) return Promise.resolve();
    
    try {
      // Process each file
      for (const fileId of fileIds) {
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('tags')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error('Error fetching file data:', fetchError);
          continue;
        }
          
        if (fileData) {
          const currentTags = fileData.tags || [];
          const updatedTags = currentTags.filter(id => id !== tagId);
          
          const { error: updateError } = await supabase
            .from('media')
            .update({ tags: updatedTags })
            .eq('id', fileId);
            
          if (updateError) {
            console.error('Error updating file tags:', updateError);
          }
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing tag from files:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to create a new tag
  const createTag = async (name: string, color: string = 'gray') => {
    if (!name.trim()) return Promise.reject(new Error('Tag name cannot be empty'));
    
    try {
      // Create tag with the current creator ID if provided
      const { data, error } = await supabase
        .from('file_tags')
        .insert({
          tag_name: name,
          creator: creatorId || 'system' // Use creatorId if available, otherwise fall back to 'system'
        })
        .select('id, tag_name')
        .single();
        
      if (error) {
        console.error('Error creating tag:', error);
        return Promise.reject(error);
      }
      
      const newTag = {
        id: data.id,
        name: data.tag_name,
        color
      };
      
      // Update the local state
      setAvailableTags(prev => [...prev, newTag]);
      return Promise.resolve(newTag);
    } catch (error) {
      console.error('Error in createTag:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to delete a tag
  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from('file_tags')
        .delete()
        .eq('id', tagId);
        
      if (error) {
        console.error('Error deleting tag:', error);
        return Promise.reject(error);
      }
      
      // Update the local state
      setAvailableTags(prev => prev.filter(tag => tag.id !== tagId));
      return Promise.resolve();
    } catch (error) {
      console.error('Error in deleteTag:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to filter files by tags
  const filterFilesByTags = (files: CreatorFileType[], tagIds: string[]) => {
    if (tagIds.length === 0) return files;
    
    // Output debugging information to the browser console
    console.log('DEBUG TAG FILTERING:');
    console.log('- Selected tag IDs:', tagIds);
    console.log('- Files to filter:', files.length);
    
    // Check if files have tags property
    const filesWithTags = files.filter(file => file.tags && file.tags.length > 0).length;
    console.log('- Files with tags:', filesWithTags);
    
    // Log tag IDs for the first few files
    const sampleFiles = files.slice(0, 3);
    sampleFiles.forEach(file => {
      console.log(`- Sample file "${file.name}" has tags:`, file.tags || []);
    });
    
    // Filter files that have at least ONE of the selected tags
    const filtered = files.filter(file => {
      if (!file.tags || file.tags.length === 0) {
        return false;
      }
      
      // Check if any of the file's tags match any of the selected tags
      const hasMatchingTag = file.tags.some(fileTagId => 
        tagIds.includes(fileTagId)
      );
      
      return hasMatchingTag;
    });
    
    console.log('- Files after filtering:', filtered.length);
    
    // Log the first few filtered files
    const sampleFilteredFiles = filtered.slice(0, 3);
    sampleFilteredFiles.forEach(file => {
      console.log(`- Filtered file "${file.name}" with tags:`, file.tags);
    });
    
    return filtered;
  };
  
  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags,
    fetchTags
  };
};
