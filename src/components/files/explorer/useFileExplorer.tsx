
import { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Folder {
  id: string;
  name: string;
}

interface UseFileExplorerProps {
  files: CreatorFileType[];
  availableFolders: Folder[];
  currentFolder: string;
  onRefresh: () => void;
  onCreateFolder: (folderName: string, fileIds: string[]) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const useFileExplorer = ({
  files,
  availableFolders,
  currentFolder,
  onRefresh,
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRemoveFromFolder
}: UseFileExplorerProps) => {
  // State variables
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  
  // Edit note state
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CreatorFileType | null>(null);
  const [editingNote, setEditingNote] = useState('');
  
  const { toast } = useToast();
  
  // Custom folders (excluding 'all' and 'unsorted')
  const customFolders = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );
  
  // Filter files based on search and type filters
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
    
    return matchesSearch && matchesType;
  });
  
  // Handler for creating a new folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Handler for deleting a folder - Modified to return a Promise
  const handleDeleteFolderClick = async (folderId: string): Promise<void> => {
    setFolderToDelete(folderId);
    setIsDeleteFolderModalOpen(true);
    return Promise.resolve(); // Return a resolved promise
  };

  // Handle the actual folder deletion
  const handleDeleteFolder = async () => {
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
  
  // Handler for note editing
  const handleEditNote = (file: CreatorFileType) => {
    setEditingFile(file);
    setEditingNote(file.description || '');
    setIsEditNoteModalOpen(true);
  };
  
  // Save the edited note
  const handleSaveNote = async () => {
    if (!editingFile) return;
    
    try {
      // Update the file's description in the database
      const { error } = await supabase
        .from('media')
        .update({ description: editingNote })
        .eq('id', editingFile.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Note updated",
        description: "File description has been updated successfully.",
      });
      
      // Close the modal and refresh the files list
      setIsEditNoteModalOpen(false);
      setEditingFile(null);
      setEditingNote('');
      onRefresh();
      
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error updating note",
        description: "An error occurred while updating the file description.",
        variant: "destructive"
      });
    }
  };
  
  // Handler for file deletion
  const handleFileDeleted = (fileId: string) => {
    // Remove the file from selectedFileIds if it's selected
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  return {
    viewMode,
    setViewMode,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    selectedFileIds,
    setSelectedFileIds,
    newFolderName,
    setNewFolderName,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    isDeleteFolderModalOpen,
    setIsDeleteFolderModalOpen,
    folderToDelete,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote, 
    setEditingNote,
    filteredFiles,
    customFolders,
    handleCreateFolderSubmit,
    handleAddToFolderSubmit,
    handleDeleteFolderClick,
    handleDeleteFolder,
    handleEditNote,
    handleSaveNote,
    handleFileDeleted
  };
};
