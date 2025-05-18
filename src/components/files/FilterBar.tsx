
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search } from "lucide-react";
import TagSelector from './TagSelector';
import { FileTag } from '@/hooks/useFileTags';

interface FilterBarProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  availableTags?: FileTag[];
  selectedTags?: string[];
  onTagSelect?: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag | null>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  availableTags = [],
  selectedTags = [],
  onTagSelect,
  onTagCreate
}) => {
  const filterOptions = [
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' },
    { value: 'archive', label: 'Archives' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search files..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        {onTagSelect && (
          <TagSelector 
            tags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
            onTagCreate={onTagCreate}
            variant="compact"
          />
        )}
        
        <div className="flex space-x-1">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={activeFilter === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(activeFilter === option.value ? null : option.value)}
              className="whitespace-nowrap"
            >
              {option.label}
            </Button>
          ))}
        </div>
        
        {activeFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange(null)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};
