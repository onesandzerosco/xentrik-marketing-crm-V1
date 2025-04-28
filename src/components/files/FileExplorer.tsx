
import React, { useState } from 'react';
import { Upload, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import PremiumCard from "@/components/ui/premium-card";
import { FileHeader } from '@/components/files/FileHeader';
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FilterBar } from '@/components/files/FilterBar';
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
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUploadFile = () => {
    document.getElementById('file-upload-trigger')?.click();
  };
  
  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };
  
  const handleRefresh = () => {
    toast({
      title: 'Refreshing files',
      description: 'Getting the latest files...'
    });
    onRefresh();
  };

  // Apply filters and search
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !activeFilter || file.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-full mx-auto space-y-6">
      <FileHeader 
        creatorName={creatorName}
        viewMode={viewMode}
        searchQuery={searchQuery}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchQuery}
      />

      <div className="flex justify-between items-center gap-4">
        <FilterBar 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange}
        />
        
        <div className="flex gap-2">
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
          <EmptyState isFiltered={!!searchQuery || !!activeFilter} />
        )}
      </PremiumCard>
      
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
