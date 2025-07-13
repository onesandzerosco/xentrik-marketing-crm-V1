
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FileTag } from '@/hooks/useFileTags';
import TagSelector from './TagSelector';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const fileTypeFilters = ['image', 'video', 'audio', 'document', 'other'];

  return (
    <div className="space-y-3">
      {/* Search Section */}
      <div className="w-full">
        {isSearchVisible ? (
          <div className="flex items-center relative">
            <Input
              className="pl-8"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 h-7 w-7 p-0"
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
            size={isMobile ? "sm" : "default"}
            onClick={() => setIsSearchVisible(true)}
            className="flex gap-2 items-center w-full justify-start"
          >
            <Search className="h-4 w-4" />
            <span>Search files...</span>
          </Button>
        )}
      </div>

      {/* File Type Filters */}
      <div className="flex flex-wrap gap-2">
        {fileTypeFilters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size={isMobile ? "sm" : "default"}
            onClick={() => onFilterChange(activeFilter === filter ? null : filter)}
            className={isMobile ? 'text-xs px-3 py-1 h-8' : ''}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>
      
      {/* Tags Section */}
      {availableTags && availableTags.length > 0 && (
        <div className="w-full">
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
  );
};
