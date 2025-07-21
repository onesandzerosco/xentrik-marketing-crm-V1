import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FileTag } from '@/hooks/useFileTags';
import TagSelector from './TagSelector';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const fileTypeFilters = ['image', 'video', 'audio', 'document', 'other'];

  const FilterButtons = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {fileTypeFilters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              onFilterChange(activeFilter === filter ? null : filter);
              if (isMobile) setIsFilterMenuOpen(false);
            }}
            className="flex-shrink-0"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>
      
      {availableTags && (
        <div>
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

  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Mobile Layout */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1">
            {isSearchVisible ? (
              <div className="flex items-center relative">
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
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSearchVisible(true)}
                className="w-full justify-start gap-2"
              >
                <Search className="h-4 w-4" />
                <span>Search files...</span>
              </Button>
            )}
          </div>

          {/* Hamburger Menu for Filters */}
          <Sheet open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <Menu className="h-4 w-4" />
                {(activeFilter || selectedTags.length > 0) && (
                  <Badge variant="secondary" className="ml-1 px-1 h-5 text-xs">
                    {(activeFilter ? 1 : 0) + selectedTags.length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterButtons />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  }

  // Desktop Layout (unchanged)
  return (
    <div className="space-y-3 md:space-y-0">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Section */}
        <div className="flex-shrink-0 md:flex-1 max-w-full md:max-w-xs">
          <div className="flex items-center relative w-full">
            <Input
              className="pl-8 pr-8"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="h-4 w-4 absolute left-2 text-muted-foreground" />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 h-7 w-7 p-0 hover:bg-muted"
                onClick={() => onSearchChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
        {availableTags && (
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
