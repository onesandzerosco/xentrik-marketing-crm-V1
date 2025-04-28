
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCreators } from '@/context/creator';
import { supabase } from '@/integrations/supabase/client';
import PremiumCard from "@/components/ui/premium-card";
import { FileHeader } from '@/components/files/FileHeader';
import { FilterButtons } from '@/components/files/FilterButtons';
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { EmptyState } from '@/components/files/EmptyState';
import FileUploader from '@/components/messages/FileUploader';
import { getFileType } from '@/utils/fileUtils';
import { ensureStorageBucket } from '@/utils/setupStorage';

interface CreatorFile {
  name: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
}

const CreatorFiles = () => {
  const { id } = useParams();
  const { getCreator } = useCreators();
  const creator = getCreator(id || '');
  const [files, setFiles] = useState<CreatorFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    ensureStorageBucket();
  }, []);

  useEffect(() => {
    const loadFiles = async () => {
      if (!creator) return;
      
      const { data: filesData, error: filesError } = await supabase.storage
        .from('creator_files')
        .list(`${creator.id}/shared`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (filesError) {
        console.error('Error loading files:', filesError);
        return;
      }

      const processedFiles = await Promise.all((filesData || []).map(async (file: any) => {
        const { data } = await supabase.storage
          .from('creator_files')
          .createSignedUrl(`${creator.id}/shared/${file.name}`, 3600);

        const fileType = file.name.split('.').pop()?.toLowerCase();
        const type = fileType ? getFileType(fileType) : 'document';

        return {
          name: file.name,
          size: file.metadata?.size || 0,
          created_at: file.created_at,
          url: data?.signedUrl || '',
          type
        };
      }));

      setFiles(processedFiles);
      setLoading(false);
    };

    loadFiles();
  }, [creator]);

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!creator) return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Creator not found</h1>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-primary-foreground"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  const handleUploadFile = () => {
    document.getElementById('file-upload-trigger')?.click();
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <FileHeader 
        creatorName={creator.name}
        viewMode={viewMode}
        searchQuery={searchQuery}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
        onUploadClick={handleUploadFile}
      />

      <FilterButtons />

      <PremiumCard className="mb-4">
        {filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            <FileGrid files={filteredFiles} />
          ) : (
            <FileList files={filteredFiles} />
          )
        ) : (
          <EmptyState />
        )}
      </PremiumCard>
      
      <div className="hidden">
        <FileUploader id="file-upload-trigger" creatorId={creator.id} />
      </div>
    </div>
  );
};

export default CreatorFiles;
