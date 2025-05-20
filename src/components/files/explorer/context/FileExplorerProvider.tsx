
import React from 'react';
import { FileExplorerProvider as ContextProvider } from './FileExplorerContext';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerProviderProps {
  children: React.ReactNode;
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  currentFolder: string;
  onFolderChange: (folderId: string) => void;
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds: string[];
  // Tag related props
  availableTags: FileTag[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  addTagToFiles: (fileIds: string[], tagName: string) => Promise<void>;
  removeTagFromFiles: (fileIds: string[], tagName: string) => Promise<void>;
  createTag: (tagName: string) => Promise<FileTag>;
  // Folder related props
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorerProvider: React.FC<FileExplorerProviderProps> = ({
  children,
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  currentFolder,
  onFolderChange,
  currentCategory,
  onCategoryChange,
  availableFolders,
  availableCategories,
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds,
  availableTags,
  selectedTags,
  setSelectedTags,
  addTagToFiles,
  removeTagFromFiles,
  createTag,
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    handleAddToFolderClick,
    handleAddToFolderSubmit,
    handleCreateNewFolder,
    handleCreateFolderSubmit,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles: baseFilteredFiles,
    isUploadModalOpen,
    setIsUploadModalOpen
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder: onCreateFolder || (async () => {}),
    onCreateCategory: onCreateCategory || (async () => {}),
    onAddFilesToFolder: onAddFilesToFolder || (async () => {}),
    onDeleteFolder: onDeleteFolder || (async () => {}),
    onDeleteCategory: onDeleteCategory || (async () => {}),
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory
  });

  // Debug logging for tag filtering
  console.log('TAG FILTERING DEBUG:');
  console.log('- Available files count:', files.length);
  console.log('- Base filtered files count (after search/type):', baseFilteredFiles.length);
  console.log('- Selected tag names for filtering:', selectedTags);
  
  // Check for files without tag information
  const filesWithoutTags = baseFilteredFiles.filter(file => !file.tags || file.tags.length === 0).length;
  console.log('- Files without tags:', filesWithoutTags);
  
  // Apply tag filtering to the already filtered files
  const filteredFiles = filterFilesByTags(baseFilteredFiles, selectedTags);
  console.log('- Final filtered files count (after tag filtering):', filteredFiles.length);
  
  // State for single file tagging
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  
  // State for tag modal
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
  // Handle tag selection
  const handleTagSelect = async (tagName: string) => {
    if (isAddTagModalOpen) {
      // If the tag modal is open, we're adding tags to selected files
      const fileIds = singleFileForTagging
        ? [singleFileForTagging.id]
        : selectedFileIds;
        
      try {
        await addTagToFiles(fileIds, tagName);
        toast({
          title: "Tag added",
          description: `Tag added to ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}.`
        });
        // Refresh the file list to show updated tags
        onRefresh();
        // Don't close the modal, allow adding multiple tags
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({
          title: "Error",
          description: "Failed to add tag to files.",
          variant: "destructive"
        });
      }
    } else {
      // If we're in the filter bar, we're toggling tag filters
      console.log('- Toggling tag filter:', tagName);
      
      setSelectedTags(prevTags => {
        if (prevTags.includes(tagName)) {
          return prevTags.filter(name => name !== tagName);
        } else {
          return [...prevTags, tagName];
        }
      });
    }
  };
  
  // Handle removing a tag from files
  const handleRemoveTagFromFile = async (tagName: string) => {
    if (!singleFileForTagging) return;
    
    try {
      await removeTagFromFiles([singleFileForTagging.id], tagName);
      toast({
        title: "Tag removed",
        description: `Tag removed from file.`
      });
      // Refresh the file list to show updated tags
      onRefresh();
      
      // Update the single file for tagging to reflect changes
      if (singleFileForTagging.tags) {
        setSingleFileForTagging({
          ...singleFileForTagging,
          tags: singleFileForTagging.tags.filter(tag => tag !== tagName)
        });
      }
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag from file.",
        variant: "destructive"
      });
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
  
  // Open the tag modal for a specific file
  const handleAddTagToFile = (file: CreatorFileType) => {
    setSingleFileForTagging(file);
    setIsAddTagModalOpen(true);
  };
  
  // Close the add tag modal and reset the single file
  useEffect(() => {
    if (!isAddTagModalOpen) {
      setSingleFileForTagging(null);
    }
  }, [isAddTagModalOpen]);
  
  // Open the add tag modal for multiple files
  const handleAddTagClick = () => {
    setSingleFileForTagging(null);
    setIsAddTagModalOpen(true);
  };

  // Filter files by tags helper function
  const filterFilesByTags = (files: CreatorFileType[], tagNames: string[]) => {
    if (tagNames.length === 0) return files;
    
    // Filter files that have at least ONE of the selected tags
    return files.filter(file => {
      if (!file.tags || file.tags.length === 0) {
        return false;
      }
      
      // Check if any of the file's tags match any of the selected tag names
      const hasMatchingTag = file.tags.some(fileTag => 
        tagNames.includes(fileTag)
      );
      
      return hasMatchingTag;
    });
  };

  const contextValue = {
    filteredFiles,
    selectedFileIds,
    setSelectedFileIds,
    onFileDeleted: handleFileDeleted,
    isLoading,
    viewMode,
    setViewMode,
    isCreatorView,
    currentFolder,
    onFolderChange,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isUploadModalOpen,
    setIsUploadModalOpen,
    onUploadComplete,
    onUploadStart,
    creatorId,
    creatorName,
    onRefresh,
    selectedTags,
    setSelectedTags,
    availableTags,
    onTagSelect: handleTagSelect,
    onTagCreate: handleCreateTag,
    onAddTagClick: handleAddTagClick,
    onAddTagToFile: handleAddTagToFile,
    currentCategory,
    onCategoryChange,
    onCreateCategory,
    onRenameFolder,
    onRenameCategory
  };

  return (
    <ContextProvider value={contextValue}>
      {children}
    </ContextProvider>
  );
};

// Import required dependencies at the top
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useFileExplorer } from '../useFileExplorer';

