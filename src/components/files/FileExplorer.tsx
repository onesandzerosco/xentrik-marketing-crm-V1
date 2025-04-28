
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
import { useToast } from '@/components/ui/use-toast';

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

  // Filter files based on search and folder
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = !activeFolder || file.type === activeFolder;
    return matchesSearch && matchesFolder;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <FileHeader 
        creatorName={creatorName}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="grid grid-cols-12 gap-6 mt-6">
        <div className="col-span-3">
          <div className="bg-accent/5 rounded-lg p-4 sticky top-4">
            <FolderNav 
              activeFolder={activeFolder}
              onFolderChange={setActiveFolder}
            />
          </div>
        </div>

        <div className="col-span-9">
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
              className="flex items-center gap-2 text-black"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </div>

          <PremiumCard className="overflow-hidden">
            {isLoading ? (
              <FileViewSkeleton viewMode={viewMode} />
            ) : filteredFiles.length > 0 ? (
              viewMode === 'grid' ? (
                <FileGrid files={filteredFiles} />
              ) : (
                <FileList files={filteredFiles} />
              )
            ) : (
              <EmptyState isFiltered={!!searchQuery || !!activeFolder} />
            )}
          </PremiumCard>
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
