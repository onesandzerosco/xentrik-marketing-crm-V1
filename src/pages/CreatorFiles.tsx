import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { FileExplorer } from '@/components/files/FileExplorer';
import { getFileType } from '@/utils/fileUtils';
import { ensureStorageBucket } from '@/utils/setupStorage';
import { v4 as uuidv4 } from 'uuid';

export interface CreatorFileType {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
  folder: string;
  status?: "uploading" | "complete";
  bucketPath?: string;
  isNewlyUploaded?: boolean;
  folderRefs?: string[]; // Array of folder IDs this file is associated with
}

interface Folder {
  id: string;
  name: string;
}

const CreatorFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const { toast } = useToast();
  
  const [currentFolder, setCurrentFolder] = useState('shared');
  const [isCurrentUserCreator, setIsCurrentUserCreator] = useState(false);
  const [recentlyUploadedIds, setRecentlyUploadedIds] = useState<string[]>([]);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([
    { id: 'shared', name: 'Shared Files' },
    { id: 'unsorted', name: 'Unsorted Uploads' }
  ]);
  
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
    loadCustomFolders();
  }, [id, navigate, creator]);
  
  // Updated to use a more reliable approach for loading folders
  const loadCustomFolders = async () => {
    if (!creator?.id) return;
    
    try {
      // First try to get custom folders from the database
      const { data: folderData, error: folderError } = await supabase
        .from('media')
        .select('folders')
        .eq('creator_id', creator.id);
      
      if (folderError) {
        console.error("Error loading folders from media table:", folderError);
        // Fall back to listing storage directories
        loadFoldersFromStorage();
        return;
      }
      
      // Extract unique folder IDs from all files
      const uniqueFolders = new Set<string>();
      folderData?.forEach(item => {
        if (item.folders && Array.isArray(item.folders)) {
          item.folders.forEach(folder => {
            if (folder !== 'shared' && folder !== 'unsorted') {
              uniqueFolders.add(folder);
            }
          });
        }
      });
      
      // Convert folder IDs to folder objects with proper naming
      const customFolders = Array.from(uniqueFolders).map(folderId => ({
        id: folderId,
        name: folderId.charAt(0).toUpperCase() + folderId.slice(1).replace(/-/g, ' ')
      }));
      
      // Set the available folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'shared' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
      // If no folders found in the database, try to list from storage as fallback
      if (customFolders.length === 0) {
        loadFoldersFromStorage();
      }
      
    } catch (err) {
      console.error("Error in loadCustomFolders:", err);
      // Fall back to listing storage directories
      loadFoldersFromStorage();
    }
  };
  
  // Fallback method to load folders from storage
  const loadFoldersFromStorage = async () => {
    if (!creator?.id) return;
    
    try {
      // Try to list all directories in the creator's storage
      const { data: folders, error } = await supabase.storage
        .from('creator_files')
        .list(creator.id, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error("Error loading folders from storage:", error);
        return;
      }
      
      // Filter to only include directories (not files)
      const customFolders = folders
        ?.filter(item => item.id && item.id !== '.' && item.id !== '..')
        ?.filter(item => !item.name.includes('.')) // Simple check to exclude files
        ?.map(folder => ({
          id: folder.name,
          name: folder.name.charAt(0).toUpperCase() + folder.name.slice(1).replace(/-/g, ' ') // Capitalize and format
        })) || [];
      
      // Add the custom folders to the available folders
      setAvailableFolders(prevFolders => {
        const existingFolders = prevFolders.filter(f => f.id === 'shared' || f.id === 'unsorted');
        return [...existingFolders, ...customFolders];
      });
      
    } catch (err) {
      console.error("Error in loadFoldersFromStorage:", err);
    }
  };
  
  const handleCreateFolder = async (folderName: string) => {
    if (!creator?.id || !folderName) return;
    
    try {
      const folderId = folderName.toLowerCase().replace(/\s+/g, '-');
      
      // Create an empty file in the folder to "create" the folder in storage
      const { error: storageError } = await supabase.storage
        .from('creator_files')
        .upload(`${creator.id}/${folderId}/.folder`, new Blob(['']));
      
      if (storageError) {
        console.error("Error creating folder in storage:", storageError);
        toast({
          title: "Warning",
          description: "Created folder in database but storage folder creation failed. Some features may be limited.",
          variant: "destructive"
        });
        // Continue anyway as we're now primarily using the database for folder tracking
      }
      
      // Create a dummy file entry in the media table to register this folder
      // This ensures the folder exists in the database even if no files are added to it
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          creator_id: creator.id,
          filename: '.folder_placeholder',
          file_size: 0,
          bucket_key: `${creator.id}/${folderId}/.folder_placeholder`,
          mime: 'text/plain',
          folders: [folderId],
          status: 'hidden'  // Special status to hide this from file listings
        });
      
      if (mediaError) {
        console.error("Error creating folder record in database:", mediaError);
        toast({
          title: "Error creating folder",
          description: mediaError.message,
          variant: "destructive"
        });
        return;
      }
      
      // Add the new folder to the available folders
      setAvailableFolders(prevFolders => [
        ...prevFolders, 
        { id: folderId, name: folderName }
      ]);
      
      // Switch to the new folder
      setCurrentFolder(folderId);
      
      toast({
        title: "Folder created",
        description: `Created folder: ${folderName}`,
      });
      
      // Refetch the files
      refetch();
      
    } catch (err) {
      console.error("Error in handleCreateFolder:", err);
      toast({
        title: "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteFolder = async (folderId: string): Promise<void> => {
    if (!creator?.id || !folderId) return Promise.reject("Missing creator or folder ID");
    
    try {
      // First, remove this folder from all files that reference it
      const { data: filesInFolder, error: filesError } = await supabase
        .from('media')
        .select('id, folders')
        .filter('creator_id', 'eq', creator.id)
        .filter('folders', 'cs', `{"${folderId}"}`); // Find files with this folder in the array
        
      if (filesError) {
        console.error("Error fetching files in folder:", filesError);
        throw filesError;
      }
      
      // Update each file to remove this folder from its folders array
      for (const file of filesInFolder || []) {
        const updatedFolders = (file.folders || []).filter(f => f !== folderId);
        
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', file.id);
          
        if (updateError) {
          console.error(`Error updating file ${file.id}:`, updateError);
          // Continue with other files even if one update fails
        }
      }
      
      // Delete the folder marker file in storage
      const { error: deleteError } = await supabase.storage
        .from('creator_files')
        .remove([`${creator.id}/${folderId}/.folder`]);
      
      if (deleteError) {
        console.error("Error deleting folder:", deleteError);
        throw deleteError;
      }
      
      // Update the UI by removing the folder from availableFolders
      setAvailableFolders(prevFolders => 
        prevFolders.filter(folder => folder.id !== folderId)
      );
      
      // If the current folder is the one being deleted, switch to 'shared'
      if (currentFolder === folderId) {
        setCurrentFolder('shared');
      }
      
      // Refresh the files list
      refetch();
      
      return Promise.resolve();
      
    } catch (err) {
      console.error("Error in handleDeleteFolder:", err);
      return Promise.reject(err);
    }
  };
  
  // Update this function to add folders to the file's folders array
  const handleAddFilesToFolder = async (fileIds: string[], targetFolderId: string) => {
    if (!creator?.id || !targetFolderId || fileIds.length === 0) return;
    
    try {
      // Update each file's folders array to include the targetFolderId
      for (const fileId of fileIds) {
        // Get the current file to access its folders array
        const { data: fileData, error: fetchError } = await supabase
          .from('media')
          .select('folders')
          .eq('id', fileId)
          .single();
          
        if (fetchError) {
          console.error(`Error fetching file ${fileId}:`, fetchError);
          continue;
        }
        
        // Create a new folders array with the new folder ID
        const currentFolders = fileData?.folders || [];
        
        // Skip if folder ID is already in the array
        if (currentFolders.includes(targetFolderId)) {
          console.log(`File ${fileId} is already in folder ${targetFolderId}`);
          continue;
        }
        
        const updatedFolders = [...currentFolders, targetFolderId];
        
        // Update the file with the new folders array
        const { error: updateError } = await supabase
          .from('media')
          .update({ folders: updatedFolders })
          .eq('id', fileId);
          
        if (updateError) {
          console.error(`Error adding file ${fileId} to folder:`, updateError);
        }
      }
      
      // Refresh the files list
      refetch();
      
    } catch (err) {
      console.error("Error in handleAddFilesToFolder:", err);
      throw err;
    }
  };
  
  const fetchCreatorFiles = async () => {
    if (!creator?.id) {
      throw new Error('Creator not found');
    }
    
    // Fetch from media table
    const { data: mediaData, error: mediaError } = await supabase
      .from('media')
      .select('*')
      .eq('creator_id', creator.id)
      .order('created_at', { ascending: false }); // Sort by most recent first
    
    if (mediaError) {
      console.error('Error fetching media data:', mediaError);
      // If there's an error, fall back to creator_files
      return fetchFromCreatorFiles();
    }
    
    if (mediaData && mediaData.length > 0) {
      // Process files from media table
      const processedFiles = await Promise.all(mediaData.map(async (media) => {
        // Get a signed URL for the file
        const { data } = await supabase.storage
          .from('raw_uploads')
          .createSignedUrl(media.bucket_key, 3600);
        
        const fileName = media.filename;
        const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
        const type = getFileType(fileExt);
        
        // Check if this file is in the recently uploaded list
        const isNewlyUploaded = recentlyUploadedIds.includes(media.id);
        
        // Get folder references from the new folders array
        const folderRefs = media.folders || [];
        
        return {
          id: media.id,
          name: fileName,
          size: media.file_size,
          created_at: media.created_at,
          url: data?.signedUrl || '',
          type,
          folder: 'shared', // Default folder
          folderRefs, // Add folder references from the array
          status: media.status as "uploading" | "complete" || 'complete',
          bucketPath: media.bucket_key,
          isNewlyUploaded
        } as CreatorFileType;
      }));
      
      return processedFiles;
    }
    
    // If no media data, fall back to creator_files
    return fetchFromCreatorFiles();
  };
  
  const fetchFromCreatorFiles = async () => {
    if (!creator?.id) {
      throw new Error('Creator not found');
    }
    
    // Get all folders including custom ones
    const folders = availableFolders.map(f => f.id);
    let allFiles: CreatorFileType[] = [];
    
    for (const folder of folders) {
      const { data: filesData, error: filesError } = await supabase.storage
        .from('creator_files')
        .list(`${creator.id}/${folder}`, {
          sortBy: { column: 'created_at', order: 'desc' }, // Sort by most recent first
        });

      if (filesError) {
        console.error(`Error fetching files from ${folder}:`, filesError);
        continue;
      }

      const processedFiles = await Promise.all((filesData || [])
        // Filter out the .folder marker file
        .filter(file => file.name !== '.folder')
        .map(async (file: any) => {
          const { data } = await supabase.storage
            .from('creator_files')
            .createSignedUrl(`${creator.id}/${folder}/${file.name}`, 3600);

          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          const type = getFileType(fileExt);
          const bucketPath = `${creator.id}/${folder}/${file.name}`;

          return {
            id: `${file.id || file.name}`,
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at || new Date().toISOString(),
            url: data?.signedUrl || '',
            type,
            folder,
            folderRefs: [folder], // Set the current folder as the folder reference
            status: 'complete' as "uploading" | "complete",
            bucketPath
          } as CreatorFileType;
        }));
      
      allFiles = [...allFiles, ...processedFiles];
    }
    
    // Sort by most recent first
    allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return allFiles;
  };

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
  const filteredFiles = currentFolder === 'shared' 
    ? files // Show all files in the shared folder
    : files.filter(file => 
        file.folderRefs?.includes(currentFolder) || // File is referenced in this folder
        file.folder === currentFolder // Or file is directly in this folder
      );

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
      isCreatorView={isCurrentUserCreator}
      onUploadComplete={handleFilesUploaded}
      onUploadStart={handleNewUploadStart}
      recentlyUploadedIds={recentlyUploadedIds}
      onCreateFolder={handleCreateFolder}
      onAddFilesToFolder={handleAddFilesToFolder}
      onDeleteFolder={handleDeleteFolder}
    />
  );
};

export default CreatorFiles;
