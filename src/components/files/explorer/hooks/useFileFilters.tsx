
import { useState, useMemo } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

interface UseFileFiltersProps {
  files: CreatorFileType[];
}

export const useFileFilters = ({ files }: UseFileFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Apply filters to the files
  const filteredFiles = useMemo(() => {
    if (!files) return [];
    
    let filtered = [...files];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) ||
        (file.description || '').toLowerCase().includes(query)
      );
    }
    
    // Filter by file types
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(file => {
        // Extract general file type category
        const fileType = file.type?.split('/')[0] || '';
        return selectedTypes.includes(fileType);
      });
    }
    
    return filtered;
  }, [files, searchQuery, selectedTypes]);

  return {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles
  };
};
