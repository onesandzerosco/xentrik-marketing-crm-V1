import { useState, useCallback } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileOperations } from '@/hooks/file-operations';
import { useFileTags } from '@/hooks/useFileTags';

interface UseFileExplorerProps {
  creatorId?: string;
  initialFiles?: CreatorFileType[];
  initialFolders?: Folder[];
  initialCategories?: Category[];
  onFilesChanged?: () => void;
}

export const useFileExplorer = (props: UseFileExplorerProps) => {
  const { creatorId, initialFiles = [], initialFolders = [], initialCategories = [], onFilesChanged } = props;
  
  // State variables
  const [files, setFiles] = useState<CreatorFileType[]>(initialFiles);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>(initialFolders);
  const [availableCategories, setAvailableCategories] = useState<Category[]>(initialCategories);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
  // Operations
  const onRefresh = () => {
    onFilesChanged?.();
  };
  
  // File operations handlers
  const {
    handleCreateFolder,
    handleCreateCategory,
    handleAddFilesToFolder,
    handleRemoveFromFolder,
    handleDeleteFolder,
    handleRenameFolder,
    handleDeleteCategory,
    handleRenameCategory
  } = useFileOperations({
    creatorId,
    onFilesChanged: onRefresh,
    setAvailableFolders,
    setAvailableCategories,
    setCurrentFolder,
    setCurrentCategory
  });
  
  // Tag operations handlers
  const {
    availableTags,
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    filterFilesByTags,
    fetchTags
  } = useFileTags({ creatorId });
  
  // File filtering
  const filteredFiles = filterFiles(files, currentFolder, currentCategory, searchQuery, selectedTypes);
  
  // Folder navigation
  const handleFolderChange = (folderId: string) => {
    setCurrentFolder(folderId);
  };
  
  const handleCategoryChange = (categoryId: string | null) => {
    setCurrentCategory(categoryId);
  };
  
  // File type filtering
  const handleTypeSelect = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };
  
  // Upload handling
  const handleUploadComplete = (fileIds?: string[]) => {
    setIsUploadModalOpen(false);
    onRefresh?.();
    
    if (fileIds && fileIds.length === 1) {
      // If only one file was uploaded, open the tag modal for it
      const uploadedFile = files.find(file => fileIds.includes(file.id));
      if (uploadedFile) {
        handleAddTagToFile(uploadedFile);
      }
    }
  };
  
  // File deletion
  const handleFileDeleted = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
    onRefresh?.();
  };
  
  // Add tag handling
  const handleAddTagClick = () => {
    setIsAddTagModalOpen(true);
  };

  const handleAddTagToFile = (file: CreatorFileType) => {
    setSingleFileForTagging(file);
    setIsAddTagModalOpen(true);
  };

  const handleTagSelect = async (tagId: string) => {
    if (singleFileForTagging) {
      // If there's a single file for tagging
      await addTagToFiles([singleFileForTagging.id], tagId);
    } else if (selectedFileIds.length > 0) {
      // If there are selected files
      await addTagToFiles(selectedFileIds, tagId);
    }
    
    // Refresh files after adding tag
    onRefresh?.();
  };
  
  // Add the tag removal handler
  const handleTagRemove = async (tagId: string) => {
    if (singleFileForTagging) {
      // If there's a single file for tagging
      await removeTagFromFiles([singleFileForTagging.id], tagId);
    } else if (selectedFileIds.length > 0) {
      // If there are selected files
      await removeTagFromFiles(selectedFileIds, tagId);
    }
    
    // Refresh files after removing tag
    onRefresh?.();
  };

  // Memoized filter function
  const filterFiles = useCallback((
    files: CreatorFileType[],
    folderId: string,
    categoryId: string | null,
    searchQuery: string,
    selectedTypes: string[]
  ): CreatorFileType[] => {
    let filtered = [...files];
    
    // Filter by folder
    if (folderId === 'root') {
      filtered = filtered.filter(file => !file.folderRefs || file.folderRefs.length === 0);
    } else {
      filtered = filtered.filter(file => file.folderRefs && file.folderRefs.includes(folderId));
    }
    
    // Filter by category
    if (categoryId) {
      filtered = filtered.filter(file => file.categoryRefs && file.categoryRefs.includes(categoryId));
    }
    
    // Filter by search query
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(file => file.name.toLowerCase().includes(lowerCaseQuery));
    }
    
    // Filter by file type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(file => selectedTypes.includes(file.type));
    }
    
    return filtered;
  }, []);
  
  // Add the tag remove handler to the returned object
  return {
    files: filteredFiles,
    availableFolders,
    availableCategories,
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    viewMode,
    setViewMode,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isUploadModalOpen,
    setIsUploadModalOpen,
    singleFileForTagging,
    setSingleFileForTagging,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    availableTags,
    selectedTags,
    setSelectedTags,
    onRefresh,
    onFileDeleted: handleFileDeleted,
    onFolderChange: handleFolderChange,
    onCategoryChange: handleCategoryChange,
    onUploadComplete: handleUploadComplete,
    onCreateCategory: handleCreateCategory,
    onRenameFolder: handleRenameFolder,
    onRenameCategory: handleRenameCategory,
    onCreateFolder: handleCreateFolder,
    onAddFilesToFolder: handleAddFilesToFolder,
    onRemoveFromFolder: handleRemoveFromFolder,
    onDeleteFolder: handleDeleteFolder,
    onDeleteCategory: handleDeleteCategory,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    filterFilesByTags,
    fetchTags,
    addTagToFiles: addTagToFiles,
    removeTagFromFiles: removeTagFromFiles,
    onAddTagClick: handleAddTagClick,
    onAddTagToFile: handleAddTagToFile,
    onTagSelect: handleTagSelect,
    onTagRemove: handleTagRemove,
  };
};
