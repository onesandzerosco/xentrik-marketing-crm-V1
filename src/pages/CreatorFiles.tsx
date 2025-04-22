
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { BackButton } from '@/components/ui/back-button';
import FileUploader from '@/components/messages/FileUploader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Folder, File } from 'lucide-react';

interface FileStats {
  images: number;
  documents: number;
  total: number;
}

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
  const [stats, setStats] = useState<FileStats>({ images: 0, documents: 0, total: 0 });

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
      updateStats(processedFiles);
      setLoading(false);
    };

    loadFiles();
  }, [creator]);

  const getFileType = (extension: string): string => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    return 'other';
  };

  const updateStats = (files: CreatorFile[]) => {
    setStats({
      images: files.filter(f => f.type === 'image').length,
      documents: files.filter(f => f.type === 'document').length,
      total: files.length
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <BackButton to="/shared-files" />
        <div>
          <h1 className="text-2xl font-semibold">{creator.name}'s Files</h1>
          <p className="text-muted-foreground">Manage and organize files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <Folder className="h-8 w-8 mb-2 text-blue-500" />
          <h3 className="text-xl font-medium">All Files</h3>
          <p className="text-3xl font-semibold mt-2">{stats.total}</p>
        </Card>
        
        <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <File className="h-8 w-8 mb-2 text-purple-500" />
          <h3 className="text-xl font-medium">Images</h3>
          <p className="text-3xl font-semibold mt-2">{stats.images}</p>
        </Card>

        <Card className="p-6 flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <File className="h-8 w-8 mb-2 text-amber-500" />
          <h3 className="text-xl font-medium">Documents</h3>
          <p className="text-3xl font-semibold mt-2">{stats.documents}</p>
        </Card>
      </div>

      <div className="space-y-6">
        <FileUploader creatorId={creator.id} folderPath="shared" />

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Files</h2>
          {files.length > 0 ? (
            <div className="space-y-3">
              {files.map((file) => (
                <div 
                  key={file.name}
                  className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <File className={`h-5 w-5 ${file.type === 'image' ? 'text-purple-500' : 'text-amber-500'}`} />
                    <span className="font-medium truncate">{file.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground mx-4">
                    {formatFileSize(file.size)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild
                  >
                    <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No files uploaded yet
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreatorFiles;
