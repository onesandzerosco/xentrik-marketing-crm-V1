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
  
  const loadCustomFolders = async () => {
    if (!creator?.id) return;
    
    try {
      // Try to list all directories in the creator's storage
      const { data: folders, error } = await supabase.storage
        .from('creator_files')
        .list(creator.id, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error("Error loading folders:", error);
        return;
      }
      
      // Filter to only include directories (not files)
      const customFolders = folders
        ?.filter(item => item.id && item.id !== '.' && item.id !== '..')
        ?.filter(item => !item.name.includes('.')) // Simple check to exclude files
        ?.map(folder => ({
          id: folder.name,
          name: folder.name.charAt(0).toUpperCase() + folder.name.slice(1) // Capitalize first letter
        })) || [];
      
      // Add the custom folders to the available folders
      setAvailableFolders(prevFolders => {
        const existingFolders = prevFolders.filter(f => f.id === 'shared' || f.id === 'unsorted');
        return [...existingFolders, ...customFolders];
      });
      
    } catch (err) {
      console.error("Error in loadCustomFolders:", err);
    }
  };
  
  const handleCreateFolder = async (folderName: string) => {
    if (!creator?.id || !folderName) return;
    
    try {
      const folderId = folderName.toLowerCase().replace(/\s+/g, '-');
      
      // Create an empty file in the folder to "create" the folder
      const { error } = await supabase.storage
        .from('creator_files')
        .upload(`${creator.id}/${folderId}/.folder`, new Blob(['']));
      
      if (error) {
        console.error("Error creating folder:", error);
        toast({
          title: "Error creating folder",
          description: error.message,
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
  
  // Change this function to add files to a folder instead of moving them
  const handleAddFilesToFolder = async (fileIds: string[], targetFolderId: string) => {
    if (!creator?.id || !targetFolderId || fileIds.length === 0) return;
    
    try {
      // Create folder references for these files
      for (const fileId of fileIds) {
        // Get existing folder references for this file (if any)
        const { data: existingRefs, error: fetchError } = await supabase
          .from('file_folder_refs')
          .select('*')
          .eq('file_id', fileId)
          .eq('folder_id', targetFolderId);
          
        if (fetchError) {
          console.error(`Error checking if file ${fileId} is already in folder:`, fetchError);
          continue;
        }
        
        // Skip if reference already exists
        if (existingRefs && existingRefs.length > 0) {
          console.log(`File ${fileId} is already in folder ${targetFolderId}`);
          continue;
        }
        
        // Add new folder reference
        const { error: insertError } = await supabase
          .from('file_folder_refs')
          .insert({
            file_id: fileId,
            folder_id: targetFolderId,
            creator_id: creator.id
          });
          
        if (insertError) {
          console.error(`Error adding file ${fileId} to folder:`, insertError);
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
      // Get folder references for all files
      const { data: folderRefs, error: refsError } = await supabase
        .from('file_folder_refs')
        .select('*')
        .eq('creator_id', creator.id);
        
      if (refsError) {
        console.error('Error fetching folder references:', refsError);
      }
      
      // Create a map of file ID to folder IDs
      const fileToFoldersMap: Record<string, string[]> = {};
      if (folderRefs) {
        folderRefs.forEach(ref => {
          if (!fileToFoldersMap[ref.file_id]) {
            fileToFoldersMap[ref.file_id] = [];
          }
          fileToFoldersMap[ref.file_id].push(ref.folder_id);
        });
      }
      
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
        
        // Get folder references for this file
        const folderRefs = fileToFoldersMap[media.id] || [];
        
        return {
          id: media.id,
          name: fileName,
          size: media.file_size,
          created_at: media.created_at,
          url: data?.signedUrl || '',
          type,
          folder: 'shared', // Default folder
          folderRefs, // Add folder references
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
    />
  );
};

export default CreatorFiles;
