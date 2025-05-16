import { CreatorFileType, Folder } from '@/types/fileTypes';
import { useFileSelection } from './hooks/useFileSelection';
import { useFolderModals } from './hooks/useFolderModals';
import { useFileNotes } from './hooks/useFileNotes';
import { useFileFilters } from './hooks/useFileFilters';
import { useUploadModal } from './hooks/useUploadModal';
import { useFolderOperations } from './hooks/useFolderOperations';

interface UseFileExplorerProps {
  files: CreatorFileType[];
  availableFolders: Folder[];
  currentFolder: string;
  onRefresh: () => void;
  onCreateFolder: (folderName: string, fileIds: string[], parentId?: string | null, isCategory?: boolean) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
}

export const useFileExplorer = ({
  files,
  availableFolders,
  currentFolder,
  onRefresh,
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRemoveFromFolder,
  onRenameFolder
}: UseFileExplorerProps) => {
  // Use all the sub-hooks
  const { 
    selectedFileIds, 
    setSelectedFileIds,
    handleFileDeleted 
  } = useFileSelection();
  
  const {
    // Standard folder modal states
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
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
    
    // Nested folder states
    isCategory,
    setIsCategory,
    parentFolderId,
    setParentFolderId,
    isCategoryModalOpen,
    setIsCategoryModalOpen, 
    isSubfolderModalOpen,
    setIsSubfolderModalOpen,
    handleCreateCategoryClick,
    handleCreateSubfolderClick
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
    handleCreateFolderSubmit: createFolderBase,
    handleAddToFolderSubmit: addToFolderBase,
    handleDeleteFolder: deleteFolderBase,
    handleRenameFolder: renameFolderBase
  } = useFolderOperations({
    onCreateFolder,
    onAddFilesToFolder,
    onDeleteFolder,
    onRenameFolder,
    onRefresh
  });
  
  // Handle creating folder with nested params
  const handleCreateFolderWithParams = (
    folderName: string,
    fileIds: string[],
    isCategory: boolean,
    parentId: string | null
  ) => {
    return onCreateFolder(folderName, fileIds, parentId, isCategory);
  };
  
  // Customize folder operations with the state values
  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      return;
    }
    
    // Create folder with parameters for nesting
    onCreateFolder(newFolderName, selectedFileIds, null, false)
      .then(() => {
        setIsAddFolderModalOpen(false);
        setNewFolderName('');
        setSelectedFileIds([]);
      })
      .catch(error => {
        console.error("Error creating folder:", error);
      });
  };
  
  // Handle category creation
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      return;
    }
    
    // Create category (no parent, isCategory=true)
    onCreateFolder(newFolderName, selectedFileIds, null, true)
      .then(() => {
        setIsCategoryModalOpen(false);
        setNewFolderName('');
        setSelectedFileIds([]);
      })
      .catch(error => {
        console.error("Error creating category:", error);
      });
  };
  
  // Handle subfolder creation
  const handleCreateSubfolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim()) {
      return;
    }
    
    // Create subfolder with parent ID
    onCreateFolder(newFolderName, selectedFileIds, parentFolderId, false)
      .then(() => {
        setIsSubfolderModalOpen(false);
        setNewFolderName('');
        setParentFolderId(null);
        setSelectedFileIds([]);
      })
      .catch(error => {
        console.error("Error creating subfolder:", error);
      });
  };
  
  const handleAddToFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Attach the required values to the event so that the handler can use them
    (e.currentTarget as any).targetFolderId = targetFolderId;
    (e.currentTarget as any).selectedFileIds = selectedFileIds;
    (e.currentTarget as any).setIsAddToFolderModalOpen = setIsAddToFolderModalOpen;
    (e.currentTarget as any).setTargetFolderId = setTargetFolderId;
    (e.currentTarget as any).setSelectedFileIds = setSelectedFileIds;
    
    addToFolderBase(e);
  };
  
  const handleDeleteFolder = () => {
    deleteFolderBase(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newFolderName.trim() || !folderToRename) {
      return;
    }
    
    renameFolderBase(folderToRename, newFolderName, setIsRenameFolderModalOpen, setFolderToRename);
  };
  
  // Custom folders (excluding 'all' and 'unsorted')
  const customFolders = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );

  // Categories for dropdown menus
  const categories = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted' && folder.isCategory === true
  );

  return {
    // File selection
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    
    // Folder modals
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    handleDeleteFolderClick,
    isRenameFolderModalOpen,
    setIsRenameFolderModalOpen,
    folderToRename,
    folderCurrentName,
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
    
    // Folder operations
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleRenameFolder,
    
    // Custom folders
    customFolders,
    
    // Nested folder states
    isCategory,
    setIsCategory,
    parentFolderId,
    setParentFolderId,
    isCategoryModalOpen,
    setIsCategoryModalOpen, 
    isSubfolderModalOpen,
    setIsSubfolderModalOpen,
    handleCreateCategoryClick,
    handleCreateSubfolderClick,
    handleCreateCategorySubmit,
    handleCreateSubfolderSubmit,
    handleCreateFolderWithParams,
    categories
  };
};
