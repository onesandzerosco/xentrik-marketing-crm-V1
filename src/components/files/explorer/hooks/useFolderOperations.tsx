
import { useToast } from "@/components/ui/use-toast";

interface Folder {
  id: string;
  name: string;
}

interface UseFolderOperationsProps {
  onCreateFolder: (folderName: string, fileIds: string[]) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRefresh: () => void;
}

export const useFolderOperations = ({
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRenameFolder,
  onRefresh
}: UseFolderOperationsProps) => {
  const { toast } = useToast();

  // Handler for creating a new folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // These values will need to be passed in from the parent component
    const { newFolderName, selectedFileIds, setIsAddFolderModalOpen, setNewFolderName, setSelectedFileIds } = 
      e.currentTarget as unknown as {
        newFolderName: string;
        selectedFileIds: string[];
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
      return;
    }
    
    try {
      await onCreateFolder(newFolderName, selectedFileIds);
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      setSelectedFileIds([]);
    } catch (error) {
      toast({
        title: "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  // Handler for adding files to an existing folder
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // These values will need to be passed in from the parent component
    const { targetFolderId, selectedFileIds, setIsAddToFolderModalOpen, setTargetFolderId, setSelectedFileIds } = 
      e.currentTarget as unknown as {
        targetFolderId: string;
        selectedFileIds: string[];
        setIsAddToFolderModalOpen: (open: boolean) => void;
        setTargetFolderId: (id: string) => void;
        setSelectedFileIds: (ids: string[]) => void;
      };
    
    if (!targetFolderId || selectedFileIds.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select a folder and at least one file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onAddFilesToFolder(selectedFileIds, targetFolderId);
      setIsAddToFolderModalOpen(false);
      setTargetFolderId('');
      toast({
        title: "Files added to folder",
        description: `${selectedFileIds.length} files added to folder successfully`,
      });
      setSelectedFileIds([]);
    } catch (error) {
      toast({
        title: "Error adding to folder",
        description: "Failed to add files to folder",
        variant: "destructive"
      });
    }
  };

  // Handle the actual folder deletion
  const handleDeleteFolder = async (folderToDelete: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => {
    if (!folderToDelete) return;
    
    try {
      await onDeleteFolder(folderToDelete);
      setFolderToDelete(null);
      setIsDeleteFolderModalOpen(false);
    } catch (error) {
      toast({
        title: "Error deleting folder",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  // Handle the actual folder renaming
  const handleRenameFolder = async (
    folderToRename: string | null, 
    newFolderName: string,
    setIsRenameFolderModalOpen: (open: boolean) => void, 
    setFolderToRename: (id: string | null) => void
  ) => {
    if (!folderToRename || !newFolderName.trim() || !onRenameFolder) return;
    
    try {
      await onRenameFolder(folderToRename, newFolderName);
      setFolderToRename(null);
      setIsRenameFolderModalOpen(false);
    } catch (error) {
      toast({
        title: "Error renaming folder",
        description: "Failed to rename folder",
        variant: "destructive"
      });
    }
  };

  return {
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolder,
    handleRenameFolder
  };
};
