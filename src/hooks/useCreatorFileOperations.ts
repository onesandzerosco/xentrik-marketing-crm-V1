
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { useFilesFetching } from '@/hooks/useFilesFetching';
import { useFolderOperations } from '@/hooks/useFolderOperations';
import { useFileOperations } from '@/hooks/file-operations';
import { useFileTags } from '@/hooks/useFileTags';
import { CreatorFileType } from '@/types/fileTypes';

interface UseCreatorFileOperationsProps {
  creatorId?: string;
  isCurrentUserCreator: boolean;
}

export const useCreatorFileOperations = ({
  creatorId,
  isCurrentUserCreator
}: UseCreatorFileOperationsProps) => {
  const { toast } = useToast();
  const [currentFolder, setCurrentFolder] = useState('all');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState<string[]>([]);

  // Custom hooks
  const { 
    availableFolders, 
    setAvailableFolders, 
    availableCategories, 
    setAvailableCategories,
    loadCustomCategoriesAndFolders 
  } = useFolderOperations({ 
    creatorId
  });
  
  const { 
    handleCreateFolder, 
    handleCreateCategory,
    handleDeleteFolder, 
    handleDeleteCategory,
    handleAddFilesToFolder, 
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory,
    handleAddTagToFiles
  } = useFileOperations({
    creatorId,
    onFilesChanged: () => refetch(),
    setAvailableFolders,
    setAvailableCategories,
    setCurrentFolder,
    setCurrentCategory
  });

  // Files fetching hook
  const { fetchCreatorFiles } = useFilesFetching({
    creatorId,
    recentlyUploadedIds,
    availableFolders
  });

  // Tags hook
  const { 
    availableTags, 
    selectedTags, 
    setSelectedTags, 
    addTagToFiles, 
    createTag
  } = useFileTags();

  const { 
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['creator-files', creatorId, currentFolder, currentCategory, recentlyUploadedIds, availableFolders, availableCategories],
    queryFn: fetchCreatorFiles,
    enabled: !!creatorId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Handler functions
  const handleFilesUploaded = (uploadedFileIds?: string[]) => {
    if (uploadedFileIds && uploadedFileIds.length > 0) {
      setRecentlyUploadedIds(uploadedFileIds);
    }
    loadCustomCategoriesAndFolders();
    refetch();
  };

  const handleNewUploadStart = () => {
    setRecentlyUploadedIds([]);
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setCurrentCategory(categoryId);
    if (!categoryId) {
      setCurrentFolder('all');
    }
  };

  const handleAddFilesToFolderWrapper = (fileIds: string[], folderId: string) => {
    return handleAddFilesToFolder(fileIds, folderId, currentCategory || 'all');
  };

  const createFolderWrapper = async (folderName: string, fileIds: string[], categoryId: string): Promise<void> => {
    await handleCreateFolder(folderName, fileIds, categoryId);
    return Promise.resolve();
  };
  
  const createCategoryWrapper = async (categoryName: string): Promise<void> => {
    await handleCreateCategory(categoryName);
    return Promise.resolve();
  };

  const handleAddTagToFilesWrapper = async (fileIds: string[], tagId: string) => {
    try {
      await handleAddTagToFiles(fileIds, tagId);
      refetch();
      toast({
        title: "Tag added",
        description: `Successfully added tag to ${fileIds.length} file(s)`,
      });
    } catch (error) {
      console.error("Error adding tag to files:", error);
      toast({
        title: "Error",
        description: "Failed to add tag to files",
        variant: "destructive",
      });
    }
  };

  // Filter files based on the current folder and category
  const filteredFiles = (() => {
    if (currentFolder === 'all') {
      if (currentCategory) {
        return files.filter(file => file.categoryRefs?.includes(currentCategory));
      } else {
        return files;
      }
    } else if (currentFolder === 'unsorted') {
      return files.filter(file => {
        const customFolders = (file.folderRefs || []).filter(
          folder => folder !== 'all' && folder !== 'unsorted'
        );
        return customFolders.length === 0;
      });
    } else {
      return files.filter(file => 
        file.folderRefs?.includes(currentFolder) || 
        file.folder === currentFolder
      );
    }
  })();

  // Handle error reporting
  if (error) {
    console.error("Error fetching files:", error);
  }

  return {
    currentFolder,
    setCurrentFolder,
    currentCategory,
    handleCategoryChange,
    files: filteredFiles,
    isLoading,
    recentlyUploadedIds,
    availableFolders,
    availableCategories,
    availableTags,
    selectedTags,
    setSelectedTags,
    handleFilesUploaded,
    handleNewUploadStart,
    createFolder: createFolderWrapper,
    createCategory: createCategoryWrapper,
    addFilesToFolder: handleAddFilesToFolderWrapper,
    deleteFolder: handleDeleteFolder,
    deleteCategory: handleDeleteCategory,
    removeFromFolder: handleRemoveFromFolder,
    renameFolder: handleRenameFolder,
    renameCategory: handleRenameCategory,
    addTagToFiles: handleAddTagToFilesWrapper,
    createTag
  };
};
