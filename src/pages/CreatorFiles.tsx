
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { FileExplorer } from '@/components/files/FileExplorer';
import { getFileType } from '@/utils/fileUtils';
import { ensureStorageBucket } from '@/utils/setupStorage';

export interface CreatorFileType {
  id: string;
  name: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
  folder: string;
  status?: 'uploading' | 'complete';
}

const CreatorFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const { toast } = useToast();
  const [currentFolder, setCurrentFolder] = useState('shared');
  
  useEffect(() => {
    ensureStorageBucket();
    
    if (!id) {
      navigate('/shared-files');
    }
  }, [id, navigate]);
  
  const fetchCreatorFiles = async () => {
    if (!creator?.id) {
      throw new Error('Creator not found');
    }
    
    // Fetch files from both shared and unsorted folders
    const folders = ['shared', 'unsorted'];
    let allFiles: CreatorFileType[] = [];
    
    for (const folder of folders) {
      const { data: filesData, error: filesError } = await supabase.storage
        .from('creator_files')
        .list(`${creator.id}/${folder}`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (filesError) {
        console.error(`Error fetching files from ${folder}:`, filesError);
        continue;
      }

      const processedFiles = await Promise.all((filesData || []).map(async (file: any) => {
        const { data } = await supabase.storage
          .from('creator_files')
          .createSignedUrl(`${creator.id}/${folder}/${file.name}`, 3600);

        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        const type = getFileType(fileExt);

        return {
          id: `${file.id || file.name}`,
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at || new Date().toISOString(),
          url: data?.signedUrl || '',
          type,
          folder,
          status: 'complete' as const
        };
      }));
      
      allFiles = [...allFiles, ...processedFiles];
    }

    return allFiles;
  };

  const { 
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['creator-files', creator?.id],
    queryFn: fetchCreatorFiles,
    enabled: !!creator?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Filter files by the current folder
  const filteredFiles = files.filter(file => file.folder === currentFolder);

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
      availableFolders={[
        { id: 'shared', name: 'Shared Files' },
        { id: 'unsorted', name: 'Unsorted Uploads' }
      ]}
    />
  );
};

export default CreatorFiles;
