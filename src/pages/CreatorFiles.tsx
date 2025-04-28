import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { useCreators } from '@/context/creator';
import { BackButton } from '@/components/ui/back-button';
import FileUploader from '@/components/messages/FileUploader';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Folder, File, Grid2x2, LayoutList, Search, Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import PremiumCard from "@/components/ui/premium-card";
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

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <File className="h-10 w-10 text-purple-500" />;
      case 'document':
        return <File className="h-10 w-10 text-amber-500" />;
      default:
        return <File className="h-10 w-10 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleUploadFile = () => {
    document.getElementById('file-upload-trigger')?.click();
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton to="/shared-files" />
            <div>
              <h1 className="text-2xl font-semibold">Welcome to {creator.name}&apos;s Drive</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="premium"
              size="sm"
              onClick={() => setViewMode('grid')}
              className="text-black"
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
            <Button
              variant="premium"
              size="sm"
              onClick={() => setViewMode('list')}
              className="text-black"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search in Drive" 
              className="pl-10 bg-accent/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleUploadFile}
            variant="premium"
            className="flex items-center gap-2 text-black"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Button variant="outline" size="sm" className="bg-white text-black hover:bg-white/90 rounded-full border-none">
          <span>Type</span>
        </Button>
        <Button variant="outline" size="sm" className="bg-white text-black hover:bg-white/90 rounded-full border-none">
          <span>Modified</span>
        </Button>
        <Button variant="outline" size="sm" className="bg-white text-black hover:bg-white/90 rounded-full border-none">
          <span>Location</span>
        </Button>
      </div>

      <PremiumCard className="mb-4">
        {filteredFiles.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
                >
                  <div className="relative w-full h-32 flex items-center justify-center mb-2">
                    {getFileIcon(file.type)}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        asChild
                        className="shadow-md"
                      >
                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-center truncate w-full">
                    {file.name}
                  </span>
                  <div className="flex justify-between w-full mt-1 text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              <div className="grid grid-cols-[1fr_120px_150px] gap-4 px-4 py-2 font-medium text-sm text-muted-foreground bg-accent/5">
                <div>Name</div>
                <div>Size</div>
                <div>Modified</div>
              </div>
              {filteredFiles.map((file) => (
                <div
                  key={file.name}
                  className="grid grid-cols-[1fr_120px_150px] gap-4 px-4 py-3 hover:bg-accent/5 transition-colors items-center"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getFileIcon(file.type)}
                    <span className="truncate">{file.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {formatDate(file.created_at)}
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
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No files uploaded yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files using the button above
            </p>
          </div>
        )}
      </PremiumCard>
    </div>
  );
};

export default CreatorFiles;
