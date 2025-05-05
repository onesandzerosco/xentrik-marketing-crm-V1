
import React from 'react';
import { Button } from "@/components/ui/button";
import { Image, Video, AudioLines, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FilterBarProps {
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  activeFilter = null, 
  onFilterChange,
  searchQuery = "",
  onSearchChange
}) => {
  const filters = [
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: AudioLines },
  ];

  return (
    <div className="flex flex-col gap-4">
      {onSearchChange && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search files..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}
      
      {onFilterChange && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {activeFilter && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 bg-accent/10 hover:bg-accent/20"
              onClick={() => onFilterChange(null)}
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          )}

          {filters.map((filter) => {
            const isActive = activeFilter === filter.id;
            return (
              <Button
                key={filter.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-gradient-premium-yellow text-black' 
                    : 'bg-accent/10 hover:bg-accent/20'
                }`}
                onClick={() => onFilterChange(isActive ? null : filter.id)}
              >
                <filter.icon className="h-3.5 w-3.5" />
                <span>{filter.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
