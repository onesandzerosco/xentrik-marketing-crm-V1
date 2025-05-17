
import { useState } from 'react';
import { Folder } from '@/types/fileTypes';

interface UseFolderManagementProps {
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRefresh: () => void;
  availableFolders: Folder[];
  currentFolder: string;
  selectedFileIds: string[];
}

export const useFolderManagement = ({
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRenameFolder,
  onRemoveFromFolder,
  onRefresh,
  availableFolders,
  currentFolder,
  selectedFileIds
}: UseFolderManagementProps) => {
  // Modal states
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategoryForNewFolder, setSelectedCategoryForNewFolder] = useState('');
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [folderCurrentName, setFolderCurrentName] = useState<string | null>(null);

  // Handle click on delete folder button
  const handleDeleteFolderClick = (folderId: string) => {
    setFolderToDelete(folderId);
    setIsDeleteFolderModalOpen(true);
  };

  // Handle click on rename folder button
  const handleRenameFolderClick = (folderId: string, currentName: string) => {
    setFolderToRename(folderId);
    setFolderCurrentName(currentName);
    setIsRenameFolderModalOpen(true);
  };

  // Handle initiating a new folder in a specific category
  const handleInitiateNewFolder = (categoryId: string = '') => {
    setSelectedCategoryForNewFolder(categoryId);
    setIsAddFolderModalOpen(true);
  };
  
  // Handler for "Add to Folder" button click
  const handleAddToFolderClick = () => {
    if (selectedFileIds.length > 0) {
      setIsAddToFolderModalOpen(true);
    }
  };

  // Handle creating a new folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as any;
    const folderName = form.newFolderName || newFolderName;
    const fileIds = form.selectedFileIds || selectedFileIds;
    const categoryId = form.categoryId || selectedCategoryForNewFolder;
    
    if (!folderName.trim() || !categoryId) {
      return;
    }
    
    try {
      await onCreateFolder(folderName, fileIds, categoryId);
      onRefresh();
      
      // Reset form state
      (form.setIsAddFolderModalOpen || setIsAddFolderModalOpen)(false);
      (form.setNewFolderName || setNewFolderName)('');
      if (form.setSelectedFileIds) {
        form.setSelectedFileIds([]);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Handle adding files to an existing folder
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.currentTarget as any;
    const folderId = form.targetFolderId || targetFolderId;
    const categoryId = form.targetCategoryId || targetCategoryId;
    const fileIds = form.selectedFileIds || selectedFileIds;
    
    if (!folderId || !fileIds.length) {
      return;
    }
    
    try {
      await onAddFilesToFolder(fileIds, folderId, categoryId);
      onRefresh();
      
      // Reset form state
      (form.setIsAddToFolderModalOpen || setIsAddToFolderModalOpen)(false);
      (form.setTargetFolderId || setTargetFolderId)('');
      if (form.setSelectedFileIds) {
        form.setSelectedFileIds([]);
      }
    } catch (error) {
      console.error('Error adding files to folder:', error);
    }
  };

  // Handle deleting a folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      await onDeleteFolder(folderToDelete);
      onRefresh();
      setIsDeleteFolderModalOpen(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  // Handle renaming a folder
  const handleRenameFolder = async (
    folderId: string | null, 
    newName: string, 
    setIsOpen: (open: boolean) => void, 
    setIdToRename: (id: string | null) => void
  ) => {
    if (!folderId || !newName.trim() || !onRenameFolder) return;
    
    try {
      await onRenameFolder(folderId, newName);
      onRefresh();
      setIsOpen(false);
      setIdToRename(null);
    } catch (error) {
      console.error('Error renaming folder:', error);
    }
  };

  // Handle removing files from a folder
  const handleRemoveFromFolder = async (fileIds: string[], folderId: string) => {
    if (!fileIds.length || !folderId || !onRemoveFromFolder) return;
    
    try {
      await onRemoveFromFolder(fileIds, folderId);
      onRefresh();
    } catch (error) {
      console.error('Error removing files from folder:', error);
    }
  };

  return {
    // State
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
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    setFolderToRename,
    folderCurrentName,
    setFolderCurrentName,
    
    // Handlers
    handleDeleteFolderClick,
    handleRenameFolderClick,
    handleInitiateNewFolder,
    handleAddToFolderClick,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleRenameFolder,
    handleRemoveFromFolder
  };
};
