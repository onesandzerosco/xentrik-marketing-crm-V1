
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

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
    // Mock tags for now - in a real app, fetch these from Supabase
    const defaultTags: FileTag[] = [
      { id: 'important', name: 'Important', color: 'red' },
      { id: 'review', name: 'Review', color: 'amber' },
      { id: 'approved', name: 'Approved', color: 'green' },
      { id: 'draft', name: 'Draft', color: 'blue' },
      { id: 'archive', name: 'Archive', color: 'gray' },
    ];
    
    setAvailableTags(defaultTags);
  }, []);
  
  const addTagToFiles = (fileIds: string[], tagId: string) => {
    // In a real implementation, update the database
    console.log('Adding tag', tagId, 'to files', fileIds);
    return Promise.resolve();
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
