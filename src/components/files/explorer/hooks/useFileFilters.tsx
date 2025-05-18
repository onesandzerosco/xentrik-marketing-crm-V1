
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

interface UseFileFiltersProps {
  files: CreatorFileType[];
  selectedTags?: string[];
}

export const useFileFilters = ({ files, selectedTags = [] }: UseFileFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter files based on search, type filters
  const filteredFiles = files.filter(file => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter  
    const matchesType = selectedTypes.length === 0 || 
      (file.type && selectedTypes.some(type => file.type.startsWith(type)));
    
    return matchesSearch && matchesType;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    selectedTags,
    viewMode,
    setViewMode,
    filteredFiles
  };
};
