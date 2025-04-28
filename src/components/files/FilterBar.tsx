
import React from 'react';
import { Button } from "@/components/ui/button";
import { File, Image, FileText, Video, AudioLines, X } from 'lucide-react';

interface FilterBarProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'image', label: 'Images', icon: Image },
    { id: 'document', label: 'Documents', icon: FileText },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: AudioLines },
    { id: 'other', label: 'Other', icon: File },
  ];

  return (
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
  );
};
