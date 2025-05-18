
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useFileSelection = () => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Handler for file deletion
  const handleFileDeleted = async (fileId: string): Promise<void> => {
    // Remove the file from selectedFileIds if it's selected
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    return Promise.resolve();
  };

  // Toggle file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  // Check if a file is selected
  const isFileSelected = (fileId: string) => {
    return selectedFileIds.includes(fileId);
  };

  // Select all files
  const selectAllFiles = (fileIds: string[]) => {
    setSelectedFileIds(fileIds);
  };

  // Unselect all files
  const clearSelection = () => {
    setSelectedFileIds([]);
  };

  // Helper function to check if files are selected and display toast if not
  const ensureFilesSelected = () => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "Select files first",
        description: "Please select at least one file",
      });
      return false;
    }
    return true;
  };

  return {
    selectedFileIds,
    setSelectedFileIds,
    toggleFileSelection,
    isFileSelected,
    selectAllFiles,
    clearSelection,
    handleFileDeleted,
    ensureFilesSelected
  };
};
