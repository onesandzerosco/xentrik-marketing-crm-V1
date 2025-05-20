
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useTagsFetching } from './tags/useTagsFetching';
import { useTagManagement } from './tags/useTagManagement';
import { filterFilesByTags } from './tags/tagUtils';
import { FileTag, UseFileTagsProps } from './tags/types';

export { FileTag } from './tags/types';

export const useFileTags = (props: UseFileTagsProps = {}) => {
  const { availableTags, setAvailableTags, isLoading, fetchTags } = useTagsFetching(props);
  const { addTagToFiles, removeTagFromFiles, removeTagFromFile, createTag: createTagBase, deleteTag } = useTagManagement(props.creatorId);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Wrap createTag to update local state after creation
  const createTag = async (name: string, color: string = 'gray'): Promise<FileTag> => {
    const newTag = await createTagBase(name, color);
    // Update the local state
    setAvailableTags(prev => [...prev, newTag]);
    return newTag;
  };
  
  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    isLoading,
    addTagToFiles,
    removeTagFromFiles,
    removeTagFromFile,
    createTag,
    deleteTag,
    filterFilesByTags,
    fetchTags
  };
};
