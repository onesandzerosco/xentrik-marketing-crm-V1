import { useState, useCallback } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileOperations } from '@/hooks/file-operations';
import { useFileTags } from '@/hooks/useFileTags';

interface UseFileExplorerProps {
  files: CreatorFileType[];
  availableFolders: Folder[];
  availableCategories: Category[];
  currentFolder: string;
  currentCategory: string | null;
  onRefresh: () => void;
  onCategoryChange: (categoryId: string | null) => void;
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const useFileExplorer = (props: UseFileExplorerProps) => {
  const { 
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
    onRenameCategory
  } = props;
  
  // State variables
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Folder modal states
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategoryForNewFolder, setSelectedCategoryForNewFolder] = useState('');
  
  // Note modal states
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CreatorFileType | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  
  // Tag operations handlers
  const {
    availableTags,
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags,
    fetchTags
  } = useFileTags();
  
  // File filtering
  const baseFilteredFiles = files.filter(file => {
    // Filter by search query
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by file type
    if (selectedTypes.length > 0 && !selectedTypes.includes(file.type)) {
      return false;
    }
    
    return true;
  });
  
  // File deletion handler
  const handleFileDeleted = (fileId: string) => {
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    onRefresh();
  };
  
  // Folder operations
  const handleAddToFolderClick = () => {
    if (selectedFileIds.length === 0) return;
    setIsAddToFolderModalOpen(true);
  };
  
  const handleCreateNewFolder = () => {
    setIsAddFolderModalOpen(true);
  };
  
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddFilesToFolder) return;

    try {
      await onAddFilesToFolder(selectedFileIds, targetFolderId, targetCategoryId);
      setIsAddToFolderModalOpen(false);
      setSelectedFileIds([]);
      onRefresh();
    } catch (error) {
      console.error('Error adding files to folder:', error);
    }
  };
  
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCreateFolder) return;

    try {
      await onCreateFolder(
        newFolderName,
        selectedFileIds,
        selectedCategoryForNewFolder || currentCategory || 'all'
      );
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      setSelectedFileIds([]);
      onRefresh();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  
  // Note operations
  const handleEditNote = (file: CreatorFileType) => {
    setEditingFile(file);
    setEditingNote(file.description || '');
    setIsEditNoteModalOpen(true);
  };
  
  const handleSaveNote = async () => {
    if (!editingFile) return;
    
    try {
      // Update note in the database
      const response = await fetch(`/api/files/${editingFile.id}/note`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: editingNote }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }
      
      // Close the modal and refresh
      setIsEditNoteModalOpen(false);
      setEditingFile(null);
      setEditingNote(null);
      onRefresh();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };
  
  return {
    files,
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
    availableTags,
    selectedTags,
    setSelectedTags,
    filteredFiles: baseFilteredFiles,
    onRefresh,
    handleFileDeleted,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    handleAddToFolderClick,
    handleAddToFolderSubmit,
    handleCreateNewFolder,
    handleCreateFolderSubmit,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags,
    fetchTags
  };
};
