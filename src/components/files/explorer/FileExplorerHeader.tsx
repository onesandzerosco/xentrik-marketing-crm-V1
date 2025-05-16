
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, Grid, List, Upload, RefreshCw, FolderPlus } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface FileExplorerHeaderProps {
  creatorName: string;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
  onUploadClick: () => void;
  isCreatorView: boolean;
  onRefresh: () => void;
  selectedFileIds: string[];
  onAddToFolderClick: () => void;
}

export const FileExplorerHeader: React.FC<FileExplorerHeaderProps> = ({
  creatorName,
  viewMode,
  setViewMode,
  onUploadClick,
  isCreatorView,
  onRefresh,
  selectedFileIds,
  onAddToFolderClick
}) => {
  const handleViewModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value);
    }
  };

  return (
    <div className="w-full flex items-center justify-between p-4 border-b">
      <div>
        <h1 className="text-xl font-semibold">Files for {creatorName}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Show Add to Folder button only when files are selected */}
        {selectedFileIds.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onAddToFolderClick}
            className="flex items-center"
          >
            <FolderPlus className="mr-1 h-4 w-4" />
            Add to Folder
          </Button>
        )}
        
        {/* View mode toggle */}
        <ToggleGroup 
          type="single" 
          value={viewMode} 
          onValueChange={handleViewModeChange}
          className="border rounded-md"
        >
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        
        {/* Refresh button */}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh}
          title="Refresh"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        
        {/* Upload button (only shown for creators) */}
        {isCreatorView && (
          <Button 
            onClick={onUploadClick}
            className="flex items-center"
          >
            <Upload className="mr-1 h-4 w-4" />
            Upload
          </Button>
        )}
      </div>
    </div>
  );
};
