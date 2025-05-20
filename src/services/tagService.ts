
import { supabase } from '@/integrations/supabase/client';
import { FileTag } from '@/types/tagTypes';
import { getTagColor } from '@/utils/tagUtils';

/**
 * Fetches tags from the database, filtered by creator if specified
 * @param creatorId Optional creator ID to filter tags by
 * @returns Array of tags formatted to the FileTag interface
 */
export const fetchTags = async (creatorId?: string): Promise<FileTag[]> => {
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
      return [];
    }
    
    if (!data) {
      console.log('No tags found');
      return [];
    }
    
    // Transform the database tags to our FileTag interface
    const formattedTags = data.map(tag => ({
      id: tag.id,
      name: tag.tag_name,
      color: getTagColor(tag.tag_name)
    }));
    
    return formattedTags;
  } catch (error) {
    console.error('Error in fetchTags:', error);
    return [];
  }
};

/**
 * Adds a tag to one or more files
 * @param fileIds Array of file IDs to add the tag to
 * @param tagId ID of the tag to add
 * @returns Promise resolving when operation is complete
 */
export const addTagToFiles = async (fileIds: string[], tagId: string): Promise<void> => {
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

/**
 * Removes a tag from one or more files
 * @param fileIds Array of file IDs to remove the tag from
 * @param tagId ID of the tag to remove
 * @returns Promise resolving when operation is complete
 */
export const removeTagFromFiles = async (fileIds: string[], tagId: string): Promise<void> => {
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

/**
 * Creates a new tag
 * @param name Name of the tag to create
 * @param creatorId ID of the creator (or 'system' if not specified)
 * @param color Optional color for the tag
 * @returns Promise resolving to the newly created tag
 */
export const createTag = async (name: string, creatorId?: string, color: string = 'gray'): Promise<FileTag> => {
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

/**
 * Deletes a tag
 * @param tagId ID of the tag to delete
 * @returns Promise resolving when operation is complete
 */
export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('file_tags')
      .delete()
      .eq('id', tagId);
      
    if (error) {
      console.error('Error deleting tag:', error);
      return Promise.reject(error);
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error in deleteTag:', error);
    return Promise.reject(error);
  }
};
