
import React, { useState } from 'react';
import { Upload, RefreshCw, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FolderNav } from '@/components/files/FolderNav';
import { EmptyState } from '@/components/files/EmptyState';
import { FileViewSkeleton } from '@/components/files/FileViewSkeleton';
import FileUploader from '@/components/messages/FileUploader';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUploadFile = () => {
    document.getElementById('file-upload-trigger')?.click();
  };

  const handleRefresh = () => {
    toast({
      title: 'Refreshing files',
      description: 'Getting the latest files...'
    });
    onRefresh();
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r p-4">
        <FolderNav 
          activeFolder={activeFolder}
          onFolderChange={setActiveFolder}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{creatorName}'s Files</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleUploadFile}
                variant="default"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Files area */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <FileViewSkeleton viewMode={viewMode} />
          ) : filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <FileGrid files={filteredFiles} />
            ) : (
              <FileList files={filteredFiles} />
            )
          ) : (
            <EmptyState isFiltered={!!searchQuery} />
          )}
        </div>
      </div>
      
      <div className="hidden">
        <FileUploader 
          id="file-upload-trigger" 
          creatorId={creatorId} 
          onUploadComplete={onRefresh}
        />
      </div>
    </div>
  );
};
