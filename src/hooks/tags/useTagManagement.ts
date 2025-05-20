
import { supabase } from '@/integrations/supabase/client';
import { FileTag } from './types';
import { getTagColor } from './tagUtils';

export const useTagManagement = (creatorId?: string) => {
  // Function to add a tag to files
  const addTagToFiles = async (fileIds: string[], tagId: string) => {
    if (!fileIds.length || !tagId) return Promise.resolve();
    
    try {
      // First get the tag name from the tag ID
      const { data: tagData, error: tagError } = await supabase
        .from('file_tags')
        .select('tag_name')
        .eq('id', tagId)
        .single();
        
      if (tagError || !tagData) {
        console.error('Error fetching tag name:', tagError);
        return Promise.reject(tagError || new Error('Tag not found'));
      }
      
      const tagName = tagData.tag_name;
      
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
          if (!currentTags.includes(tagName)) {  // Store tag name instead of ID
            const updatedTags = [...currentTags, tagName];
            
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
  
  // Function to remove a tag from a single file by tag name
  const removeTagFromFile = async (tagName: string, fileId: string) => {
    if (!fileId || !tagName) return Promise.resolve();
    
    try {
      // Get current tags for the file
      const { data: fileData, error: fetchError } = await supabase
        .from('media')
        .select('tags')
        .eq('id', fileId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching file data:', fetchError);
        return Promise.reject(fetchError);
      }
      
      if (fileData) {
        const currentTags = fileData.tags || [];
        const updatedTags = currentTags.filter(tag => tag !== tagName);
        
        // Update the file with the new tags array
        const { error: updateError } = await supabase
          .from('media')
          .update({ tags: updatedTags })
          .eq('id', fileId);
          
        if (updateError) {
          console.error('Error updating file tags:', updateError);
          return Promise.reject(updateError);
        }
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing tag from file:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to remove a tag from multiple files
  const removeTagFromFiles = async (fileIds: string[], tagId: string) => {
    if (!fileIds.length || !tagId) return Promise.resolve();
    
    try {
      // First get the tag name from the tag ID
      const { data: tagData, error: tagError } = await supabase
        .from('file_tags')
        .select('tag_name')
        .eq('id', tagId)
        .single();
        
      if (tagError || !tagData) {
        console.error('Error fetching tag name:', tagError);
        return Promise.reject(tagError || new Error('Tag not found'));
      }
      
      const tagName = tagData.tag_name;
      
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
          const updatedTags = currentTags.filter(tag => tag !== tagName);  // Filter by tag name
          
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
      
      return Promise.resolve(newTag);
    } catch (error) {
      console.error('Error in createTag:', error);
      return Promise.reject(error);
    }
  };
  
  // Function to delete a tag
  const deleteTag = async (tagId: string) => {
    try {
      // Get the tag name first for cleanup
      const { data: tagData, error: getError } = await supabase
        .from('file_tags')
        .select('tag_name')
        .eq('id', tagId)
        .single();
        
      if (getError || !tagData) {
        console.error('Error getting tag name:', getError);
        return Promise.reject(getError || new Error('Tag not found'));
      }
      
      const tagName = tagData.tag_name;
      
      // Delete the tag
      const { error } = await supabase
        .from('file_tags')
        .delete()
        .eq('id', tagId);
        
      if (error) {
        console.error('Error deleting tag:', error);
        return Promise.reject(error);
      }
      
      // Clean up tag references in all media files
      const { data: mediaFiles, error: mediaError } = await supabase
        .from('media')
        .select('id, tags');
        
      if (!mediaError && mediaFiles) {
        for (const file of mediaFiles) {
          if (file.tags && file.tags.includes(tagName)) {
            const updatedTags = file.tags.filter(tag => tag !== tagName);
            
            await supabase
              .from('media')
              .update({ tags: updatedTags })
              .eq('id', file.id);
          }
        }
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error in deleteTag:', error);
      return Promise.reject(error);
    }
  };

  return {
    addTagToFiles,
    removeTagFromFiles,
    removeTagFromFile,
    createTag,
    deleteTag
  };
};
