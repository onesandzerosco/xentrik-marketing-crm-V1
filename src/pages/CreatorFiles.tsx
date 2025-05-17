
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { FileExplorer } from '@/components/files/FileExplorer';
import { ensureStorageBucket } from '@/utils/setupStorage';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useFolderOperations } from '@/hooks/useFolderOperations';
import { useFileOperations } from '@/hooks/useFileOperations';
import { useFilesFetching } from '@/hooks/useFilesFetching';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';

const CreatorFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const { toast } = useToast();
  const permissions = useFilePermissions();
  
  const [currentFolder, setCurrentFolder] = useState('all');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState<string[]>([]);
  
  // Custom hooks
  const { 
    availableFolders, 
    setAvailableFolders, 
    availableCategories, 
    setAvailableCategories,
    loadCustomCategoriesAndFolders 
  } = useFolderOperations({ 
    creatorId: creator?.id 
  });
  
  const { 
    handleCreateFolder, 
    handleCreateCategory,
    handleDeleteFolder, 
    handleDeleteCategory,
    handleAddFilesToFolder, 
    handleRemoveFromFolder,
    handleRenameFolder,
    handleRenameCategory
  } = useFileOperations({
    creatorId: creator?.id,
    onFilesChanged: () => refetch(),
    setAvailableFolders,
    setAvailableCategories,
    setCurrentFolder,
    setCurrentCategory
  });
  
  // Files fetching hook
  const { fetchCreatorFiles } = useFilesFetching({
    creatorId: creator?.id,
    recentlyUploadedIds,
    availableFolders
  });
  
  useEffect(() => {
    ensureStorageBucket();
    
    if (!id) {
      navigate('/shared-files');
    }
    
    // Check if the current user is the creator
    const checkCreatorStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && creator && user.id === creator.id) {
        setIsCurrentUserCreator(true);
      }
    };
    
    checkCreatorStatus();
  }, [id, navigate, creator]);
  
  const { 
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['creator-files', creator?.id, currentFolder, currentCategory, recentlyUploadedIds, availableFolders, availableCategories],
    queryFn: fetchCreatorFiles,
    enabled: !!creator?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Filter files based on the current folder and category
  const filteredFiles = (() => {
    if (currentFolder === 'all') {
      if (currentCategory) {
        // Show all files in the selected category
        return files.filter(file => file.categoryRefs?.includes(currentCategory));
      } else {
        // Show all files when 'all' is selected and no category filter
        return files;
      }
    } else if (currentFolder === 'unsorted') {
      // Show files that aren't in any custom folders (improved logic)
      return files.filter(file => {
        // Get all folder references except 'all' and 'unsorted'
        const customFolders = (file.folderRefs || []).filter(
          folder => folder !== 'all' && folder !== 'unsorted'
        );
        // If there are no custom folders, this file belongs in 'unsorted'
        return customFolders.length === 0;
      });
    } else {
      // Show files in the selected custom folder
      return files.filter(file => 
        file.folderRefs?.includes(currentFolder) || // File is referenced in this folder
        file.folder === currentFolder // Or file is directly in this folder
      );
    }
  })();

  // Handle when files are uploaded
  const handleFilesUploaded = (uploadedFileIds?: string[]) => {
    if (uploadedFileIds && uploadedFileIds.length > 0) {
      // Set the recently uploaded file IDs
      setRecentlyUploadedIds(uploadedFileIds);
    }
    // Refresh the custom folders and categories list in case any were created during upload
    loadCustomCategoriesAndFolders();
    refetch();
  };
  
  // Clear the recently uploaded IDs when a new upload occurs
  const handleNewUploadStart = () => {
    setRecentlyUploadedIds([]);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId: string | null) => {
    setCurrentCategory(categoryId);
    if (!categoryId) {
      setCurrentFolder('all'); // Reset to all files when no category is selected
    }
  };

  // Wrapper to make the return type of these functions match the expected Promise<void>
  const createFolderWrapper = async (folderName: string, fileIds: string[], categoryId: string): Promise<void> => {
    await handleCreateFolder(folderName, fileIds, categoryId);
    return Promise.resolve();
  };
  
  const createCategoryWrapper = async (categoryName: string): Promise<void> => {
    await handleCreateCategory(categoryName);
    return Promise.resolve();
  };

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading files',
        description: error instanceof Error ? error.message : 'Failed to load files',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (!creator) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Creator not found</h1>
        <p className="mt-2">
          The creator you're looking for doesn't exist or you don't have access.
        </p>
      </div>
    );
  }

  return (
    <FileExplorer 
      files={filteredFiles}
      creatorName={creator.name}
      creatorId={creator.id}
      isLoading={isLoading}
      onRefresh={refetch}
      onFolderChange={setCurrentFolder}
      currentFolder={currentFolder}
      onCategoryChange={handleCategoryChange}
      currentCategory={currentCategory}
      availableFolders={availableFolders}
      availableCategories={availableCategories}
      isCreatorView={isCurrentUserCreator || permissions.canEdit || permissions.canDelete}
      onUploadComplete={handleFilesUploaded}
      onUploadStart={handleNewUploadStart}
      recentlyUploadedIds={recentlyUploadedIds}
      onCreateFolder={createFolderWrapper}
      onCreateCategory={createCategoryWrapper}
      onAddFilesToFolder={handleAddFilesToFolder}
      onDeleteFolder={handleDeleteFolder}
      onDeleteCategory={handleDeleteCategory}
      onRemoveFromFolder={handleRemoveFromFolder}
      onRenameFolder={handleRenameFolder}
      onRenameCategory={handleRenameCategory}
    />
  );
};

export default CreatorFiles;
