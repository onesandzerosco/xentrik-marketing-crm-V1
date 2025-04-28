
import React from 'react';
import { Folder } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FolderNavProps {
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export const FolderNav: React.FC<FolderNavProps> = ({ activeFolder, onFolderChange }) => {
  const folders = [
    { id: 'images', label: 'Images' },
    { id: 'documents', label: 'Documents' },
    { id: 'videos', label: 'Videos' },
    { id: 'audio', label: 'Audio' },
    { id: 'other', label: 'Other Files' }
  ];

  return (
    <div className="border rounded-lg bg-accent/5 p-4 space-y-2">
      <Button
        variant={!activeFolder ? "premium" : "ghost"}
        size="sm"
        className="w-full justify-start gap-2"
        onClick={() => onFolderChange(null)}
      >
        <Folder className="h-4 w-4" />
        <span>All Files</span>
      </Button>
      
      {folders.map((folder) => (
        <Button
          key={folder.id}
          variant={activeFolder === folder.id ? "premium" : "ghost"}
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => onFolderChange(folder.id)}
        >
          <Folder className="h-4 w-4" />
          <span>{folder.label}</span>
        </Button>
      ))}
    </div>
  );
};
