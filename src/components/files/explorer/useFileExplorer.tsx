
import { useState } from 'react';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileSelection } from './hooks/useFileSelection';
import { useFolderModals } from './hooks/useFolderModals';
import { useFileNotes } from './hooks/useFileNotes';
import { useFileFilters } from './hooks/useFileFilters';
import { useUploadModal } from './hooks/useUploadModal';
import { useCategoryOperations } from './hooks/useCategoryOperations';
import { useFolderManagement } from './hooks/useFolderManagement';
import { useNewFolderFlow } from './hooks/useNewFolderFlow';

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
  
  // Category operations hook
  const categoryOps = useCategoryOperations({
    onCreateCategory,
    onDeleteCategory,
    onRenameCategory,
    onRefresh,
    availableCategories,
    currentCategory,
    onCategoryChange
  });
  
  // Folder management hook
  const folderOps = useFolderManagement({
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onRenameFolder,
    onRemoveFromFolder,
    onRefresh,
    availableFolders,
    currentFolder,
    selectedFileIds
  });
  
  // New folder flow hook
  const folderFlow = useNewFolderFlow({
    onRefresh,
    availableCategories
  });
  
  // Customize folder operations with the state values
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryOps.newCategoryName.trim()) {
      return;
    }
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).newCategoryName = categoryOps.newCategoryName;
    (e.currentTarget as any).setIsAddCategoryModalOpen = categoryOps.setIsAddCategoryModalOpen;
    (e.currentTarget as any).setNewCategoryName = categoryOps.setNewCategoryName;
    
    const result = categoryOps.handleCreateCategorySubmit(e);
    
    // Check if we need to continue the flow
    if (result) {
      folderFlow.handleCategoryCreatedInFlow(
        categoryOps.newCategoryName,
        folderOps.setIsAddFolderModalOpen,
        folderOps.setSelectedCategoryForNewFolder
      );
    }
  };
  
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderOps.newFolderName.trim() || !folderOps.selectedCategoryForNewFolder) {
      return;
    }
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).newFolderName = folderOps.newFolderName;
    (e.currentTarget as any).selectedFileIds = selectedFileIds;
    (e.currentTarget as any).categoryId = folderOps.selectedCategoryForNewFolder;
    (e.currentTarget as any).setIsAddFolderModalOpen = folderOps.setIsAddFolderModalOpen;
    (e.currentTarget as any).setNewFolderName = folderOps.setNewFolderName;
    (e.currentTarget as any).setSelectedFileIds = setSelectedFileIds;
    
    folderOps.handleCreateFolderSubmit(e);
  };
  
  const handleAddToFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).targetFolderId = folderOps.targetFolderId;
    (e.currentTarget as any).targetCategoryId = folderFlow.targetCategoryId;
    (e.currentTarget as any).selectedFileIds = selectedFileIds;
    (e.currentTarget as any).setIsAddToFolderModalOpen = folderOps.setIsAddToFolderModalOpen;
    (e.currentTarget as any).setTargetFolderId = folderOps.setTargetFolderId;
    (e.currentTarget as any).setSelectedFileIds = setSelectedFileIds;
    
    folderOps.handleAddToFolderSubmit(e);
  };
  
  // Handler for creating a new category from the AddToFolder modal
  const handleCreateNewCategory = () => {
    folderFlow.handleCreateNewCategory(
      folderOps.setIsAddToFolderModalOpen,
      categoryOps.setIsAddCategoryModalOpen
    );
  };
  
  // Handler for creating a new folder from the AddToFolder modal
  const handleCreateNewFolder = () => {
    folderFlow.handleCreateNewFolder(
      folderOps.setIsAddToFolderModalOpen,
      folderOps.setIsAddFolderModalOpen,
      folderOps.setSelectedCategoryForNewFolder
    );
  };

  // Handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await onDeleteCategory(categoryId);
      
      // If we're in the deleted category, reset to 'all'
      if (currentCategory === categoryId) {
        onCategoryChange(null);
      }
      
      onRefresh();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  return {
    // File selection
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    
    // Category operations - from categoryOps
    ...categoryOps,
    
    // Folder operations - from folderOps
    ...folderOps,
    
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
    
    // Connected handlers
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleCreateNewCategory,
    handleCreateNewFolder,
    handleDeleteCategory,
    
    // Available data
    availableFolders,
    availableCategories
  };
};
