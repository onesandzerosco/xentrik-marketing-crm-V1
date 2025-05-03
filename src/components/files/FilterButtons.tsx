
import React from 'react';
import { Button } from "@/components/ui/button";
import { ListFilter, RefreshCcw, Grid, List } from 'lucide-react';

interface FilterButtonsProps {
  view: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  onRefresh: () => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({ view, onViewChange, onRefresh }) => {
  return (
    <div className="flex items-center space-x-2">
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
