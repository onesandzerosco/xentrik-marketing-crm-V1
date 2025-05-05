
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export const useFileSelection = () => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Handler for file deletion
  const handleFileDeleted = (fileId: string) => {
    // Remove the file from selectedFileIds if it's selected
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
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
    handleFileDeleted,
    ensureFilesSelected
  };
};
