
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';

export interface FileTag {
  id: string;
  name: string;
  color: string;
}

export const useFileTags = () => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // In a real implementation, these would be fetched from the database
  useEffect(() => {
    // Simplified tags to just NSFW and SFW
    const defaultTags: FileTag[] = [
      { id: 'nsfw', name: 'NSFW', color: 'red' },
      { id: 'sfw', name: 'SFW', color: 'green' },
    ];
    
    setAvailableTags(defaultTags);
  }, []);
  
  const addTagToFiles = async (fileIds: string[], tagId: string) => {
    // In a real implementation, update the database
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
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding tag to files:', error);
      return Promise.reject(error);
    }
  };
  
  const removeTagFromFiles = (fileIds: string[], tagId: string) => {
    // In a real implementation, update the database
    console.log('Removing tag', tagId, 'from files', fileIds);
    return Promise.resolve();
  };
  
  const createTag = (name: string, color: string = 'gray') => {
    const newTag = {
      id: `tag-${Date.now()}`,
      name,
      color
    };
    
    setAvailableTags(prev => [...prev, newTag]);
    return Promise.resolve(newTag);
  };
  
  const deleteTag = (tagId: string) => {
    setAvailableTags(prev => prev.filter(tag => tag.id !== tagId));
    return Promise.resolve();
  };
  
  const filterFilesByTags = (files: CreatorFileType[], tagIds: string[]) => {
    if (tagIds.length === 0) return files;
    
    return files.filter(file => {
      // In a real implementation, check if file has any of the selected tags
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
    filterFilesByTags
  };
};
