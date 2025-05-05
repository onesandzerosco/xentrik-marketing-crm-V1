
import React from 'react';
import { FolderNav } from '../FolderNav';
import { useToast } from "@/components/ui/use-toast";

interface Folder {
  id: string;
  name: string;
}

interface FileExplorerSidebarProps {
  folders: Folder[];
  currentFolder: string;
  onFolderChange: (folderId: string) => void;
  onInitiateNewFolder: () => void;
  onDeleteFolder: (folderId: string) => Promise<void>;
  selectedFileIds: string[];
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  folders,
  currentFolder,
  onFolderChange,
  onInitiateNewFolder,
  onDeleteFolder,
  selectedFileIds
}) => {
  const { toast } = useToast();
  
  const handleInitiateNewFolder = () => {
    if (selectedFileIds.length > 0) {
      onInitiateNewFolder();
    } else {
      toast({
        title: "Select files first",
        description: "Please select at least one file to add to a new folder",
      });
    }
  };

  return (
    <div className="lg:w-64 shrink-0 mt-1">
      <FolderNav 
        folders={folders}
        currentFolder={currentFolder}
        onFolderChange={onFolderChange}
        onInitiateNewFolder={handleInitiateNewFolder}
        onDeleteFolder={onDeleteFolder}
      />
    </div>
  );
};
