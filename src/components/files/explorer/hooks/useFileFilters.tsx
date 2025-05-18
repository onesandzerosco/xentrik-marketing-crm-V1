
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

export const useFileFilters = ({ files }: { files: CreatorFileType[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter files based on search and type filters
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
    
    return matchesSearch && matchesType;
  });

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
