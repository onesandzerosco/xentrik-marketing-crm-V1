import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { BackButton } from '@/components/ui/back-button';
import FileUploader from '@/components/messages/FileUploader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Folder, File, Grid2x2, LayoutList } from 'lucide-react';

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

  const getFileType = (extension: string): string => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    return 'other';
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <File className="h-6 w-6 text-purple-500" />;
      default:
        return <File className="h-6 w-6 text-amber-500" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BackButton to="/shared-files" />
          <div>
            <h1 className="text-2xl font-semibold">{creator.name}'s Files</h1>
            <p className="text-muted-foreground">Manage and organize files</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-accent' : ''}
          >
            <Grid2x2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-accent' : ''}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <FileUploader creatorId={creator.id} folderPath="shared" />

        <Card className="p-6">
          {files.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    {getFileIcon(file.type)}
                    <span className="mt-2 text-sm font-medium text-center truncate w-full">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(file.size)}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 mt-2 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        asChild
                        className="w-full"
                      >
                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(file.type)}
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
            )}
          ) : (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No files uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload files using the button above
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CreatorFiles;
