
import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from '@/components/ui/back-button';
import { Grid2x2, LayoutList, Search } from 'lucide-react';

interface FileHeaderProps {
  creatorName: string;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
}

export const FileHeader: React.FC<FileHeaderProps> = ({
  creatorName,
  viewMode,
  searchQuery,
  onViewModeChange,
  onSearchChange,
  onUploadClick
}) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton to="/shared-files" />
          <div>
            <h1 className="text-2xl font-semibold">Welcome to {creatorName}&apos;s Drive</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="premium"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="text-black"
          >
            <Grid2x2 className="h-4 w-4" />
          </Button>
          <Button
            variant="premium"
            size="sm"
            onClick={() => onViewModeChange('list')}
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={onUploadClick}
          variant="premium"
          className="flex items-center gap-2 text-black"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>
      </div>
    </div>
  );
};
