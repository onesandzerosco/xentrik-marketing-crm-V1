
import { useState, useEffect } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { FileTag, UseFileTagsProps } from '@/types/tagTypes';
import * as tagService from '@/services/tagService';
import { filterFilesByTags } from '@/utils/tagUtils';

export { FileTag } from '@/types/tagTypes';

export const useFileTags = ({ creatorId }: UseFileTagsProps = {}) => {
  const [availableTags, setAvailableTags] = useState<FileTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch tags from the database
  const fetchTags = async () => {
    setIsLoading(true);
    try {
      const tags = await tagService.fetchTags(creatorId);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTags();
  }, [creatorId]); // Re-fetch tags when creator ID changes
  
  // Function to add a tag to files
  const addTagToFiles = async (fileIds: string[], tagId: string) => {
    await tagService.addTagToFiles(fileIds, tagId);
  };
  
  // Function to remove a tag from files
  const removeTagFromFiles = async (fileIds: string[], tagId: string) => {
    await tagService.removeTagFromFiles(fileIds, tagId);
  };
  
  // Function to create a new tag
  const createTag = async (name: string, color: string = 'gray') => {
    const newTag = await tagService.createTag(name, creatorId, color);
    // Update the local state
    setAvailableTags(prev => [...prev, newTag]);
    return newTag;
  };
  
  // Function to delete a tag
  const deleteTag = async (tagId: string) => {
    await tagService.deleteTag(tagId);
    // Update the local state
    setAvailableTags(prev => prev.filter(tag => tag.id !== tagId));
    return Promise.resolve();
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
