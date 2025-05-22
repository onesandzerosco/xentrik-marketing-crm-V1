
import { useToast } from "@/components/ui/use-toast";
import { Category } from '@/types/fileTypes';

interface Folder {
  id: string;
  name: string;
  categoryId?: string;
}

interface UseFolderOperationsProps {
  onCreateFolder: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
  onRefresh: () => void;
}

export const useFolderOperations = ({
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory,
  onRefresh
}: UseFolderOperationsProps) => {
  const { toast } = useToast();

  // Handler for creating a new category
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // These values will need to be passed in from the parent component
    const { newCategoryName, setIsAddCategoryModalOpen, setNewCategoryName } = 
      e.currentTarget as unknown as {
        newCategoryName: string;
        setIsAddCategoryModalOpen: (open: boolean) => void;
        setNewCategoryName: (name: string) => void;
      };
    
    if (!newCategoryName.trim()) {
      toast({
        title: "Category name required",
        description: "Please enter a valid category name",
        variant: "destructive"
      });
      return Promise.reject(new Error("Category name required"));
    }
    
    try {
      await onCreateCategory(newCategoryName);
      setIsAddCategoryModalOpen(false);
      setNewCategoryName('');
      toast({
        title: "Category created",
        description: `Successfully created category: ${newCategoryName}`,
      });
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error creating category",
        description: "Failed to create category",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Handler for creating a new folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // These values will need to be passed in from the parent component
    const { newFolderName, selectedFileIds, categoryId, setIsAddFolderModalOpen, setNewFolderName, setSelectedFileIds } = 
      e.currentTarget as unknown as {
        newFolderName: string;
        selectedFileIds: string[];
        categoryId: string;
        setIsAddFolderModalOpen: (open: boolean) => void;
        setNewFolderName: (name: string) => void;
        setSelectedFileIds: (ids: string[]) => void;
      };
    
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a valid folder name",
        variant: "destructive"
      });
      return Promise.reject(new Error("Folder name required"));
    }
    
    if (!categoryId) {
      toast({
        title: "Category required",
        description: "Please select a category for the new folder",
        variant: "destructive"
      });
      return Promise.reject(new Error("Category required"));
    }
    
    try {
      await onCreateFolder(newFolderName, selectedFileIds, categoryId);
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      setSelectedFileIds([]);
      toast({
        title: "Folder created",
        description: `Successfully created folder: ${newFolderName}`,
      });
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Handler for adding files to an existing folder
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // These values will need to be passed in from the parent component
    const { targetFolderId, targetCategoryId, selectedFileIds, setIsAddToFolderModalOpen, setTargetFolderId, setSelectedFileIds } = 
      e.currentTarget as unknown as {
        targetFolderId: string;
        targetCategoryId: string;
        selectedFileIds: string[];
        setIsAddToFolderModalOpen: (open: boolean) => void;
        setTargetFolderId: (id: string) => void;
        setSelectedFileIds: (ids: string[]) => void;
      };
    
    if (!targetFolderId || !targetCategoryId || selectedFileIds.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select a category, folder, and at least one file",
        variant: "destructive"
      });
      return Promise.reject(new Error("Selection required"));
    }
    
    try {
      await onAddFilesToFolder(selectedFileIds, targetFolderId, targetCategoryId);
      setIsAddToFolderModalOpen(false);
      setTargetFolderId('');
      toast({
        title: "Files added to folder",
        description: `${selectedFileIds.length} files added to folder successfully`,
      });
      setSelectedFileIds([]);
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error adding to folder",
        description: "Failed to add files to folder",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Handle the actual folder deletion
  const handleDeleteFolder = (folderToDelete: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => {
    if (!folderToDelete) return Promise.reject(new Error("No folder selected"));
    
    return onDeleteFolder(folderToDelete)
      .then(() => {
        setFolderToDelete(null);
        setIsDeleteFolderModalOpen(false);
        toast({
          title: "Folder deleted",
          description: "Folder has been deleted successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Error deleting folder",
          description: "Failed to delete folder",
          variant: "destructive"
        });
        return Promise.reject(error);
      });
  };

  // Handle the actual category deletion
  const handleDeleteCategory = (categoryToDelete: string | null, setIsDeleteCategoryModalOpen: (open: boolean) => void, setCategoryToDelete: (id: string | null) => void) => {
    if (!categoryToDelete) return Promise.reject(new Error("No category selected"));
    
    return onDeleteCategory(categoryToDelete)
      .then(() => {
        setCategoryToDelete(null);
        setIsDeleteCategoryModalOpen(false);
        toast({
          title: "Category deleted",
          description: "Category and its folders have been deleted successfully",
        });
      })
      .catch(error => {
        toast({
          title: "Error deleting category",
          description: "Failed to delete category",
          variant: "destructive"
        });
        return Promise.reject(error);
      });
  };

  // Handle the actual folder renaming - updated to properly request the rename operation
  const handleRenameFolder = async (
    folderToRename: string | null, 
    newFolderName: string,
    setIsRenameFolderModalOpen: (open: boolean) => void, 
    setFolderToRename: (id: string | null) => void
  ) => {
    if (!folderToRename || !newFolderName.trim() || !onRenameFolder) {
      return Promise.reject(new Error("Invalid folder rename parameters"));
    }
    
    try {
      await onRenameFolder(folderToRename, newFolderName);
      setFolderToRename(null);
      setIsRenameFolderModalOpen(false);
      toast({
        title: "Folder renamed",
        description: `Folder renamed to "${newFolderName}" successfully`,
      });
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error renaming folder",
        description: "Failed to rename folder",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Handle the actual category renaming - updated to properly request the rename operation
  const handleRenameCategory = async (
    categoryToRename: string | null, 
    newCategoryName: string,
    setIsRenameCategoryModalOpen: (open: boolean) => void, 
    setCategoryToRename: (id: string | null) => void
  ) => {
    if (!categoryToRename || !newCategoryName.trim() || !onRenameCategory) {
      return Promise.reject(new Error("Invalid category rename parameters"));
    }
    
    try {
      await onRenameCategory(categoryToRename, newCategoryName);
      setCategoryToRename(null);
      setIsRenameCategoryModalOpen(false);
      toast({
        title: "Category renamed",
        description: `Category renamed to "${newCategoryName}" successfully`,
      });
      return Promise.resolve();
    } catch (error) {
      toast({
        title: "Error renaming category",
        description: "Failed to rename category",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  return {
    handleCreateCategorySubmit,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleDeleteCategory,
    handleRenameFolder,
    handleRenameCategory
  };
};
