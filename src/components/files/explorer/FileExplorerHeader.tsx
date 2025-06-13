
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, Grid, List, Upload, RefreshCw, FolderPlus } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/context/AuthContext';
import { ContentGuideDownloader } from '@/components/onboarding/ContentGuideDownloader';

interface FileExplorerHeaderProps {
  creatorName: string;
  viewMode: "list" | "grid";
  setViewMode: (mode: "list" | "grid") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedFileIds: string[];
  setSelectedFileIds: (ids: string[]) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (isOpen: boolean) => void;
  handleAddToFolderClick: () => void;
  isCreatorView: boolean;
  onRefresh?: () => void;
}

export const FileExplorerHeader: React.FC<FileExplorerHeaderProps> = ({
  creatorName,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  selectedTypes,
  setSelectedTypes,
  selectedFileIds,
  setSelectedFileIds,
  isUploadModalOpen,
  setIsUploadModalOpen,
  handleAddToFolderClick,
  isCreatorView,
  onRefresh
}) => {
  const { isCreator } = useAuth();
  
  const handleViewModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value);
    }
  };

  const onUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="w-full border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-xl font-semibold">Files for {creatorName}</h1>
          </div>
          
          {/* Content Guide Download Button - Only show for Creators */}
          {isCreator && (
            <ContentGuideDownloader />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Show Add to Folder button only when files are selected */}
          {selectedFileIds.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddToFolderClick}
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
    </div>
  );
};
