
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FileTag } from '@/hooks/useFileTags';
import TagSelector from './TagSelector';

interface FilterBarProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags?: FileTag[];
  selectedTags?: string[];
  onTagSelect?: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  availableTags = [],
  selectedTags = [],
  onTagSelect = () => {},
  onTagCreate
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const fileTypeFilters = ['image', 'video', 'audio', 'document', 'other'];

  return (
    <div className="space-y-3 md:space-y-0">
      {/* Mobile: Stack vertically, Desktop: Single row */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Section */}
        <div className="flex-shrink-0 md:flex-1 max-w-full md:max-w-xs">
          {isSearchVisible ? (
            <div className="flex items-center relative w-full">
              <Input
                className="pl-8 pr-8"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <Search className="h-4 w-4 absolute left-2 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 h-7 w-7 p-0 hover:bg-muted"
                onClick={() => {
                  onSearchChange('');
                  setIsSearchVisible(false);
                }}
              >
                &times;
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSearchVisible(true)}
              className="flex gap-2 items-center w-full md:w-auto justify-center md:justify-start"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Button>
          )}
        </div>

        {/* Filter Buttons Section */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {fileTypeFilters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange(activeFilter === filter ? null : filter)}
              className="flex-shrink-0"
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>

        {/* Tags Section */}
        {availableTags && availableTags.length > 0 && (
          <div className="flex-shrink-0">
            <TagSelector
              tags={availableTags}
              selectedTags={selectedTags}
              onTagSelect={onTagSelect}
              onTagCreate={onTagCreate}
              variant="compact"
            />
          </div>
        )}
      </div>
    </div>
  );
};
