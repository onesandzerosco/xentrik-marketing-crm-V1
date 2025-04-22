
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FileUploader from '@/components/messages/FileUploader';

const SharedFiles = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedFolder, setSharedFolder] = useState<any>(null);

  useEffect(() => {
    const loadSharedFolder = async () => {
      try {
        const { data, error } = await supabase
          .from('shared_folders')
          .select('*')
          .eq('share_code', shareCode)
          .single();

        if (error) throw error;
        if (!data) throw new Error('Shared folder not found');

        // Check if the share link has expired
        if (new Date(data.expires_at) < new Date()) {
          throw new Error('This share link has expired');
        }

        setSharedFolder(data);
      } catch (error) {
        console.error('Error loading shared folder:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadSharedFolder();
  }, [shareCode]);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !sharedFolder) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-red-500">Error</h1>
        <p className="mt-2">{error || 'Shared folder not found'}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Shared Files</h1>
      
      <FileUploader
        creatorId={sharedFolder.creator_id}
        folderPath={sharedFolder.folder_path}
      />
    </div>
  );
};

export default SharedFiles;
