
import { useState, useEffect } from 'react';
import { useFileTags } from '@/hooks/useFileTags';
import { CreatorFileType } from '@/types/fileTypes';
import { useToast } from '@/hooks/use-toast';

interface UseTagOperationsProps {
  creatorId: string;
  onRefresh: () => void;
}

export const useTagOperations = ({ creatorId, onRefresh }: UseTagOperationsProps) => {
  const { toast } = useToast();
  
  // Access the file tags functionality
  const { 
    availableTags, 
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags,
    removeTagFromFile
  } = useFileTags({ creatorId });
  
  // State for tracking which file is currently being tagged
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
  // Reset the single file when the modal closes
  useEffect(() => {
    if (!isAddTagModalOpen) {
      setSingleFileForTagging(null);
    }
  }, [isAddTagModalOpen]);
  
  // Handle tag selection
  const handleTagSelect = async (tagId: string) => {
    if (isAddTagModalOpen) {
      // If the tag modal is open, we're adding tags to selected files
      const fileIds = singleFileForTagging
        ? [singleFileForTagging.id]
        : [];
        
      try {
        // Then perform the actual tag operation
        await addTagToFiles(fileIds, tagId);
        toast({
          title: "Tag added",
          description: `Tag added to ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}.`
        });
        
        // Refresh file list to show updated tags in other components
        onRefresh();
        
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({
          title: "Error",
          description: "Failed to add tag to files.",
          variant: "destructive"
        });
      }
    } else {
      console.log('- Toggling tag filter:', tagId);

      // Find the tag name from the tag ID
      const tag = availableTags.find(t => t.id === tagId);
      if (tag) {
        setSelectedTags(prevTags => {
          if (prevTags.includes(tag.name)) {
            return prevTags.filter(name => name !== tag.name);
          } else {
            return [...prevTags, tag.name];
          }
        });
      }
    }
  };
  
  // Handle creating a new tag
  const handleCreateTag = async (tagName: string) => {
    try {
      const newTag = await createTag(tagName);
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };

  // Handle tag removal for a specific file
  const handleRemoveTag = async (tagName: string, fileId: string) => {
    try {
      await removeTagFromFile(tagName, fileId);
      
      // Refresh the file list to show updated tags in other components
      onRefresh();
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };
  
  // Open the tag modal for a specific file
  const handleAddTagToFile = (file: CreatorFileType) => {
    setSingleFileForTagging(file);
    setIsAddTagModalOpen(true);
  };
  
  // Open the add tag modal for multiple files
  const handleAddTagClick = () => {
    setSingleFileForTagging(null);
    setIsAddTagModalOpen(true);
  };
  
  return {
    availableTags,
    selectedTags,
    setSelectedTags,
    handleTagSelect,
    handleCreateTag,
    handleRemoveTag,
    handleAddTagToFile,
    handleAddTagClick,
    singleFileForTagging,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    filterFilesByTags
  };
};
