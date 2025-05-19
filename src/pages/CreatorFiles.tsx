
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';
import { FileExplorer } from '@/components/files/FileExplorer';
import { ensureStorageBucket } from '@/utils/setupStorage';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useCreatorFileOperations } from '@/hooks/useCreatorFileOperations';
import CreatorNotFound from '@/components/files/creator/CreatorNotFound';

const CreatorFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const permissions = useFilePermissions();
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);

  // Check if the current user is the creator
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

  // Use our custom hook to manage file operations
  const fileOperations = useCreatorFileOperations({
    creatorId: creator?.id,
    isCurrentUserCreator
  });

  // If no creator is found, show an error message
  if (!creator) {
    return <CreatorNotFound />;
  }

  // Has edit privileges if user is the creator or has explicit permission
  const hasEditPrivileges = isCurrentUserCreator || permissions.canEdit || permissions.canDelete;

  return (
    <FileExplorer 
      files={fileOperations.files}
      creatorName={creator.name}
      creatorId={creator.id}
      isLoading={fileOperations.isLoading}
      onRefresh={() => fileOperations.refetch}
      onFolderChange={fileOperations.setCurrentFolder}
      currentFolder={fileOperations.currentFolder}
      onCategoryChange={fileOperations.handleCategoryChange}
      currentCategory={fileOperations.currentCategory}
      availableFolders={fileOperations.availableFolders}
      availableCategories={fileOperations.availableCategories}
      isCreatorView={hasEditPrivileges}
      onUploadComplete={fileOperations.handleFilesUploaded}
      onUploadStart={fileOperations.handleNewUploadStart}
      recentlyUploadedIds={fileOperations.recentlyUploadedIds}
      onCreateFolder={fileOperations.createFolder}
      onCreateCategory={fileOperations.createCategory}
      onAddFilesToFolder={fileOperations.addFilesToFolder}
      onDeleteFolder={fileOperations.deleteFolder}
      onDeleteCategory={fileOperations.deleteCategory}
      onRemoveFromFolder={fileOperations.removeFromFolder}
      onRenameFolder={fileOperations.renameFolder}
      onRenameCategory={fileOperations.renameCategory}
      availableTags={fileOperations.availableTags}
      selectedTags={fileOperations.selectedTags}
      setSelectedTags={fileOperations.setSelectedTags}
      onTagCreate={fileOperations.createTag}
      onAddTagToFiles={fileOperations.addTagToFiles}
    />
  );
};

export default CreatorFiles;
