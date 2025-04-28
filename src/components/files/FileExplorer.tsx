
import React, { useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PremiumCard from "@/components/ui/premium-card";
import { FileHeader } from '@/components/files/FileHeader';
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
    <div className="max-w-[1400px] mx-auto p-6">
      <FileHeader 
        creatorName={creatorName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="mt-6 flex gap-6">
        <aside className="w-56">
          <PremiumCard className="p-4">
            <FolderNav 
              activeFolder={activeFolder}
              onFolderChange={setActiveFolder}
            />
          </PremiumCard>
        </aside>

        <main className="flex-1">
          <div className="flex justify-end gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            
            <Button 
              onClick={handleUploadFile}
              variant="premium"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </div>

          <PremiumCard>
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
          </PremiumCard>
        </main>
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
