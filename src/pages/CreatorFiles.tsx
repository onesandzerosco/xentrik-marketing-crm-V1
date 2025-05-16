
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
import { CreatorFileType, Folder } from '@/types/fileTypes';

const CreatorFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const { toast } = useToast();
  const permissions = useFilePermissions();
  
  const [currentFolder, setCurrentFolder] = useState('all');
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState<string[]>([]);
  
  // Custom hooks
  const { availableFolders, setAvailableFolders, loadCustomFolders } = useFolderOperations({ 
    creatorId: creator?.id 
  });
  
  const { 
    handleCreateFolder, 
    handleDeleteFolder, 
    handleAddFilesToFolder, 
    handleRemoveFromFolder,
    handleRenameFolder
  } = useFileOperations({
    creatorId: creator?.id,
    onFilesChanged: () => refetch(),
    setAvailableFolders,
    setCurrentFolder
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
    queryKey: ['creator-files', creator?.id, currentFolder, recentlyUploadedIds, availableFolders],
    queryFn: fetchCreatorFiles,
    enabled: !!creator?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Filter files based on the current folder
  const filteredFiles = (() => {
    if (currentFolder === 'all') {
      // Show all files when 'all' is selected
      return files;
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
    // Refresh the custom folders list in case any were created during upload
    loadCustomFolders();
    refetch();
  };
  
  // Clear the recently uploaded IDs when a new upload occurs
  const handleNewUploadStart = () => {
    setRecentlyUploadedIds([]);
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
      availableFolders={availableFolders}
      isCreatorView={isCurrentUserCreator || permissions.canEdit || permissions.canDelete}
      onUploadComplete={handleFilesUploaded}
      onUploadStart={handleNewUploadStart}
      recentlyUploadedIds={recentlyUploadedIds}
      onCreateFolder={handleCreateFolder}
      onAddFilesToFolder={handleAddFilesToFolder}
      onDeleteFolder={handleDeleteFolder}
      onRemoveFromFolder={handleRemoveFromFolder}
      onRenameFolder={handleRenameFolder}
    />
  );
};

export default CreatorFiles;
