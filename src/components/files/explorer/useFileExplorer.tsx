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
    handleCreateCategorySubmit: createCategoryBase,
    handleCreateFolderSubmit: createFolderBase,
    handleAddToFolderSubmit: addToFolderBase,
    handleDeleteFolder: deleteFolderBase,
    handleDeleteCategory: deleteCategoryBase,
    handleRenameFolder: renameFolderBase,
    handleRenameCategory: renameCategoryBase
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
    
    createCategoryBase(e).then(() => {
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
    
    createFolderBase(e);
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
    
    addToFolderBase(e);
  };
  
  const handleDeleteFolder = () => {
    deleteFolderBase(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const handleDeleteCategory = () => {
    deleteCategoryBase(categoryToDelete, setIsDeleteCategoryModalOpen, setCategoryToDelete);
  };
  
  // Create a proper function to handle the rename category modal opening
  const handleRenameCategoryClick = (categoryId: string, currentName: string) => {
    setCategoryToRename(categoryId);
    setCategoryCurrentName(currentName);
    setIsRenameCategoryModalOpen(true);
  };
  
  // Create a proper function to handle the rename folder modal opening
  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    setFolderToRename(folderId);
    setFolderCurrentName(currentName);
    setIsRenameFolderModalOpen(true);
  };
  
  // Fix rename handlers to properly work with modals
  const handleRenameCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryToRename || !categoryCurrentName.trim()) return;
    
    if (onRenameCategory) {
      onRenameCategory(categoryToRename, categoryCurrentName)
        .then(() => {
          setIsRenameCategoryModalOpen(false);
          setCategoryToRename(null);
          toast({
            title: "Category renamed",
            description: `Category renamed successfully`
          });
        })
        .catch(error => {
          toast({
            title: "Error renaming category",
            description: "Failed to rename category",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !folderCurrentName.trim()) return;
    
    if (onRenameFolder) {
      onRenameFolder(folderToRename, folderCurrentName)
        .then(() => {
          setIsRenameFolderModalOpen(false);
          setFolderToRename(null);
          toast({
            title: "Folder renamed",
            description: `Folder renamed successfully`
          });
        })
        .catch(error => {
          toast({
            title: "Error renaming folder",
            description: "Failed to rename folder",
            variant: "destructive"
          });
        });
    }
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
    handleDeleteFolder,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory,
    
    // Available data
    availableFolders,
    availableCategories
  };
};
