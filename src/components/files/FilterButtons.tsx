
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCcw, Grid, List, Download, Trash2 } from 'lucide-react';

interface FilterButtonsProps {
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  onRefresh: () => void;
  onBulkDownload?: () => void;
  onBulkDelete?: () => void;
  selectedFilesCount?: number;
  canDelete?: boolean;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({ 
  view, 
  onViewChange, 
  onRefresh, 
  onBulkDownload,
  onBulkDelete,
  selectedFilesCount = 0,
  canDelete = false
}) => {
  return (
    <div className="flex items-center space-x-2">
      {selectedFilesCount > 0 && onBulkDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDownload}
          className="flex items-center gap-1"
        >
          <Download className="h-4 w-4 mr-1" />
          Download {selectedFilesCount} files
        </Button>
      )}
      
      {selectedFilesCount > 0 && canDelete && onBulkDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="flex items-center gap-1 text-destructive border-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete {selectedFilesCount} files
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        title="Refresh"
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('list')}
        title="List view"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="icon"
        onClick={() => onViewChange('grid')}
        title="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Button>
    </div>
  );
};
