
import { useState, useMemo } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

interface UseFileFiltersProps {
  files: CreatorFileType[];
  selectedTags?: string[];
}

export const useFileFilters = ({ files, selectedTags = [] }: UseFileFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter files based on search, type filters and tags
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        (file.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (file.filename?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Type filter  
      const matchesType = selectedTypes.length === 0 || 
        (file.type && selectedTypes.some(type => file.type?.startsWith(type)));
      
      // Tag filter
      const matchesTags = selectedTags.length === 0 || 
        (file.tags && file.tags.some(tag => selectedTags.includes(tag)));
      
      return matchesSearch && matchesType && matchesTags;
    });
  }, [files, searchQuery, selectedTypes, selectedTags]);

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
