
import React from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, Grid, List, Upload, RefreshCw, FolderPlus, Menu } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/context/AuthContext';
import { ContentGuideDownloader } from '@/components/onboarding/ContentGuideDownloader';
import { useIsMobile } from '@/hooks/use-mobile';

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
  onToggleSidebar?: () => void;
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
  onRefresh,
  onToggleSidebar
}) => {
  const { isCreator } = useAuth();
  const isMobile = useIsMobile();
  
  const handleViewModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value);
    }
  };

  const onUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  return (
    <div className="w-full border-b bg-background">
      <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-2">
          {isMobile && onToggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {isMobile ? 'Files' : `Files for ${creatorName}`}
            </h1>
          </div>
        </div>
        
        <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
          {/* Content Guide Download Button - Show for Creators on all devices */}
          {isCreator && (
            <ContentGuideDownloader />
          )}
          
          {/* Show Add to Folder button only when files are selected */}
          {selectedFileIds.length > 0 && (
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "sm"}
              onClick={handleAddToFolderClick}
              className="flex items-center"
            >
              <FolderPlus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-1'}`} />
              {!isMobile && 'Add to Folder'}
            </Button>
          )}
          
          {/* View mode toggle */}
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={handleViewModeChange}
            className="border rounded-md"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className={isMobile ? 'h-8 w-8 p-1' : ''}>
              <Grid className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className={isMobile ? 'h-8 w-8 p-1' : ''}>
              <List className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </ToggleGroupItem>
          </ToggleGroup>
          
          {/* Refresh button */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onRefresh}
            title="Refresh"
            className={isMobile ? 'h-8 w-8' : ''}
          >
            <RefreshCw className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
          
          {/* Upload button (only shown for creators) */}
          {isCreatorView && (
            <Button 
              onClick={onUploadClick}
              className={`flex items-center ${isMobile ? 'h-8 px-3' : ''}`}
              size={isMobile ? "sm" : "default"}
            >
              <Upload className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-1'}`} />
              {!isMobile && 'Upload'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
