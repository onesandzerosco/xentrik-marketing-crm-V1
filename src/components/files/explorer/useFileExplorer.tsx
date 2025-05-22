
import { useState } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileSelection } from './hooks/useFileSelection';
import { useFolderModals } from './hooks/useFolderModals';
import { useFileNotes } from './hooks/useFileNotes';
import { useFileFilters } from './hooks/useFileFilters';
import { useUploadModal } from './hooks/useUploadModal';
import { useFolderOperations } from './hooks/useFolderOperations';

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
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
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
  onRenameCategory
}: UseFileExplorerProps) => {
  // Use all the sub-hooks
  const { 
    selectedFileIds, 
    setSelectedFileIds,
    handleFileDeleted 
  } = useFileSelection();
  
  const {
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    handleDeleteCategoryClick,
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName,
    setCategoryCurrentName,
    handleRenameCategoryClick,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    setFolderToDelete,
    handleDeleteFolderClick,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName,
    setFolderCurrentName,
    handleRenameFolderClick
  } = useFolderModals();
  
  const {
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote, 
    setEditingNote,
    handleEditNote,
    handleSaveNote
  } = useFileNotes({ onRefresh });
  
  const {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles
  } = useFileFilters({ files });
  
  const {
    isUploadModalOpen,
    setIsUploadModalOpen
  } = useUploadModal();
  
  const {
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory
  } = useFolderOperations({
    onCreateFolder,
    onCreateCategory,
    onAddFilesToFolder,
    onDeleteFolder,
    onDeleteCategory,
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory,
    onRefresh
  });
  
  // Initialize state for category operations
  const [showNewFolderInCategory, setShowNewFolderInCategory] = useState(false);
  
  // Handle initiating a new category
  const handleInitiateNewCategory = () => {
    setIsAddCategoryModalOpen(true);
  };
  
  // Handle initiating a new folder in a specific category
  const handleInitiateNewFolder = (categoryId: string = '') => {
    setSelectedCategoryForNewFolder(categoryId || (currentCategory || ''));
    setIsAddFolderModalOpen(true);
  };
  
  // Handler for "Add to Folder" button click
  const handleAddToFolderClick = () => {
    if (selectedFileIds.length > 0) {
      setIsAddToFolderModalOpen(true);
    }
  };
  
  // Handler for creating a new category from the AddToFolder modal
  const handleCreateNewCategory = () => {
    setIsAddToFolderModalOpen(false);
    setTimeout(() => {
      setIsAddCategoryModalOpen(true);
      setShowNewFolderInCategory(true); // Flag to show folder creation after category
    }, 100);
  };
  
  // Handler for creating a new folder from the AddToFolder modal
  const handleCreateNewFolder = () => {
    if (targetCategoryId) {
      setIsAddToFolderModalOpen(false);
      setTimeout(() => {
        setSelectedCategoryForNewFolder(targetCategoryId);
        setIsAddFolderModalOpen(true);
      }, 100);
    }
  };
  
  // Customize folder operations with the state values
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      return;
    }
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).newCategoryName = newCategoryName;
    (e.currentTarget as any).setIsAddCategoryModalOpen = setIsAddCategoryModalOpen;
    (e.currentTarget as any).setNewCategoryName = setNewCategoryName;
    
    handleCreateCategorySubmit(e).then(() => {
      // If we're creating a category from the AddToFolder flow,
      // continue with folder creation after the category is created
      if (showNewFolderInCategory) {
        onRefresh(); // Refresh to get the new category
        // Wait for state update before opening folder modal
        setTimeout(() => {
          const newCategoryId = availableCategories.find(c => c.name === newCategoryName)?.id;
          if (newCategoryId) {
            setSelectedCategoryForNewFolder(newCategoryId);
            setIsAddFolderModalOpen(true);
            setShowNewFolderInCategory(false); // Reset the flag
          }
        }, 500);
      }
    });
  };
  
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim() || !selectedCategoryForNewFolder) {
      return;
    }
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).newFolderName = newFolderName;
    (e.currentTarget as any).selectedFileIds = selectedFileIds;
    (e.currentTarget as any).categoryId = selectedCategoryForNewFolder;
    (e.currentTarget as any).setIsAddFolderModalOpen = setIsAddFolderModalOpen;
    (e.currentTarget as any).setNewFolderName = setNewFolderName;
    (e.currentTarget as any).setSelectedFileIds = setSelectedFileIds;
    
    handleCreateFolderSubmit(e);
  };
  
  const handleAddToFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).targetFolderId = targetFolderId;
    (e.currentTarget as any).targetCategoryId = targetCategoryId;
    (e.currentTarget as any).selectedFileIds = selectedFileIds;
    (e.currentTarget as any).setIsAddToFolderModalOpen = setIsAddToFolderModalOpen;
    (e.currentTarget as any).setTargetFolderId = setTargetFolderId;
    (e.currentTarget as any).setSelectedFileIds = setSelectedFileIds;
    
    handleAddToFolderSubmit(e);
  };
  
  const handleDeleteFolderFn = () => {
    handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const handleDeleteCategoryFn = () => {
    handleDeleteCategory(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };
  
  // Fix rename handlers so they open the modals instead of immediately executing
  const handleRenameCategorySubmit = () => {
    if (!categoryToRename || !newCategoryName.trim()) return;
    
    handleRenameCategory(
      categoryToRename, 
      newCategoryName, 
      setIsRenameCategoryModalOpen, 
      setCategoryToRename
    );
  };
  
  const handleRenameFolderSubmit = () => {
    if (!folderToRename || !newFolderName.trim()) return;
    
    handleRenameFolder(
      folderToRename, 
      newFolderName, 
      setIsRenameFolderModalOpen, 
      setFolderToRename
    );
  };

  return {
    // File selection
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    
    // Category modals
    isAddCategoryModalOpen,
    setIsAddCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,
    isDeleteCategoryModalOpen,
    setIsDeleteCategoryModalOpen,
    categoryToDelete,
    setCategoryToDelete,
    handleDeleteCategoryClick,
    isRenameCategoryModalOpen,
    setIsRenameCategoryModalOpen,
    categoryToRename,
    setCategoryToRename,
    categoryCurrentName,
    setCategoryCurrentName,
    handleRenameCategoryClick,
    
    // Folder modals
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    setFolderToDelete,
    handleDeleteFolderClick,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName,
    setFolderCurrentName,
    handleRenameFolderClick,
    
    // File notes
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote, 
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    
    // File filtering
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles,
    
    // Upload modal
    isUploadModalOpen,
    setIsUploadModalOpen,
    
    // Category operations
    handleInitiateNewCategory,
    handleInitiateNewFolder,
    
    // Folder operations
    handleAddToFolderClick,
    handleCreateNewCategory,
    handleCreateNewFolder,
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder: handleDeleteFolderFn,
    handleDeleteCategory: handleDeleteCategoryFn,
    handleRenameFolder: handleRenameFolderSubmit,
    handleRenameCategory: handleRenameCategorySubmit,
    
    // Available data
    availableFolders,
    availableCategories
  };
};
