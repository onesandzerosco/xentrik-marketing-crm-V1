
import React from 'react';
import { Grid2x2, LayoutList, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { BackButton } from '@/components/ui/back-button';
import { Button } from "@/components/ui/button";

interface FileHeaderProps {
  creatorName: string;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSearchChange: (query: string) => void;
}

export const FileHeader: React.FC<FileHeaderProps> = ({
  creatorName,
  viewMode,
  searchQuery,
  onViewModeChange,
  onSearchChange,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <BackButton to="/shared-files" />
          <div>
            <h1 className="text-2xl font-semibold">{creatorName}&apos;s Files</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and download shared files
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'premium' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={viewMode === 'grid' ? 'text-black' : ''}
            aria-label="Grid view"
          >
            <Grid2x2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'premium' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={viewMode === 'list' ? 'text-black' : ''}
            aria-label="List view"
          >
            <LayoutList className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Search files..." 
          className="pl-10 bg-accent/10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};
