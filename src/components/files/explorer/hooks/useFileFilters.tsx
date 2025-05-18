
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';

export const useFileFilters = ({ files }: { files: CreatorFileType[] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter files based on search, type filters, and tags
  const filteredFiles = files.filter(file => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Type filter  
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
    
    // Tag filter - We'll handle this separately in the FileExplorer component
    // to avoid duplicate filtering
    
    return matchesSearch && matchesType;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    selectedTags,
    setSelectedTags,
    viewMode,
    setViewMode,
    filteredFiles
  };
};
