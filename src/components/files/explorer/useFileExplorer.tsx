
import { useState, useEffect, useCallback } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { FileTag, useFileTags } from '@/hooks/useFileTags';

interface UseFileExplorerProps {
  files: CreatorFileType[];
  availableFolders: Folder[];
  availableCategories: Category[];
  currentFolder: string;
  currentCategory: string | null;
  onRefresh: () => void;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
  creatorId?: string;
}

export const useFileExplorer = ({
  files,
  availableFolders,
  availableCategories,
  currentFolder,
  currentCategory,
  onRefresh,
  onCategoryChange,
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory,
  creatorId
}: UseFileExplorerProps) => {
  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isFileNoteModalOpen, setIsFileNoteModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
  // Selected file state
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [fileToEdit, setFileToEdit] = useState<CreatorFileType | null>(null);
  
  // File filtering
  const [filteredFiles, setFilteredFiles] = useState<CreatorFileType[]>(files);

  // Tags state
  const { 
    availableTags, 
    selectedTags, 
    setSelectedTags, 
    addTagToFiles, 
    removeTagFromFiles, 
    createTag, 
    filterFilesByTags 
  } = useFileTags({ creatorId });
  
  // Reset selected files when changing folders
  useEffect(() => {
    setSelectedFileIds([]);
  }, [currentFolder]);
  
  // Filter files based on search query, selected types, and selected tags
  useEffect(() => {
    let result = [...files];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(file => 
        file.name.toLowerCase().includes(query)
      );
    }
    
    // Filter by file type
    if (selectedTypes.length > 0) {
      result = result.filter(file => {
        const fileType = file.type.split('/')[0]; // Get main type (image, video, etc)
        return selectedTypes.includes(fileType);
      });
    }
    
    // Filter by tags
    if (selectedTags.length > 0) {
      result = filterFilesByTags(result, selectedTags);
    }
    
    setFilteredFiles(result);
  }, [files, searchQuery, selectedTypes, selectedTags, filterFilesByTags]);
  
  // Handle file deletion
  const handleFileDeleted = (fileId: string) => {
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    onRefresh();
  };
  
  // Handle modal toggles
  const handleAddToFolderClick = () => {
    setIsAddToFolderModalOpen(true);
  };
  
  const handleEditNote = (file: CreatorFileType) => {
    setFileToEdit(file);
    setIsFileNoteModalOpen(true);
  };
  
  // Handle tag operations
  const handleAddTagClick = () => {
    setIsAddTagModalOpen(true);
  };

  const handleAddTagToFile = (file: CreatorFileType) => {
    setFileToEdit(file);
    setIsAddTagModalOpen(true);
  };
  
  const onTagCreate = async (name: string): Promise<FileTag> => {
    return await createTag(name);
  };
  
  const onAddTagToFiles = async (tagName: string) => {
    if (fileToEdit) {
      await addTagToFiles([fileToEdit.id], tagName);
    } else if (selectedFileIds.length > 0) {
      await addTagToFiles(selectedFileIds, tagName);
    }
    onRefresh();
  };
  
  const onRemoveTagFromFiles = async (tagName: string) => {
    if (fileToEdit) {
      await removeTagFromFiles([fileToEdit.id], tagName);
    } else if (selectedFileIds.length > 0) {
      await removeTagFromFiles(selectedFileIds, tagName);
    }
    onRefresh();
  };
  
  return {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    isCreateFolderModalOpen,
    setIsCreateFolderModalOpen,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    isFileNoteModalOpen,
    setIsFileNoteModalOpen,
    handleAddToFolderClick,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    handleEditNote,
    fileToEdit,
    setFileToEdit,
    filteredFiles,
    // Tag related properties and methods
    selectedTags, 
    setSelectedTags,
    availableTags,
    onTagCreate,
    handleAddTagClick,
    handleAddTagToFile,
    isAddTagModalOpen,
    setIsAddTagModalOpen,
    onAddTagToFiles,
    onRemoveTagFromFiles,
    // Original function params passed through
    availableCategories
  };
};
