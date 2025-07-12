
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListFilter, Grid, List, Upload, RefreshCw, FolderPlus, Menu, X, Search } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/context/AuthContext';
import { ContentGuideDownloader } from '@/components/onboarding/ContentGuideDownloader';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';

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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  
  const handleViewModeChange = (value: string) => {
    if (value === 'grid' || value === 'list') {
      setViewMode(value);
    }
  };

  const onUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  if (isMobile) {
    return (
      <div className="w-full border-b bg-background">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold truncate max-w-[150px]">
              {creatorName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="h-8 w-8"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onRefresh}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {isCreatorView && (
              <Button 
                onClick={onUploadClick}
                size="sm"
                className="h-8 px-3"
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="px-3 pb-3">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Action Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t">
          <div className="flex items-center space-x-1">
            {selectedFileIds.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddToFolderClick}
                className="h-8 px-2 text-xs"
              >
                <FolderPlus className="h-3 w-3 mr-1" />
                Folder
              </Button>
            )}
          </div>
          
          <ToggleGroup 
            type="single" 
            value={viewMode} 
            onValueChange={handleViewModeChange}
            className="border rounded-md"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-7 w-7 p-0">
              <Grid className="h-3 w-3" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 p-0">
              <List className="h-3 w-3" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-b">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-semibold">Files for {creatorName}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Content Guide Download Button - Only show for Creators */}
          {isCreator && (
            <ContentGuideDownloader />
          )}
          
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
