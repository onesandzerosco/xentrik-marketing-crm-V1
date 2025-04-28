
import React, { useState } from 'react';
import { Folder, FolderPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface FolderNavProps {
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export const FolderNav: React.FC<FolderNavProps> = ({ activeFolder, onFolderChange }) => {
  const [folders, setFolders] = useState<Array<{id: string, label: string}>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder = {
      id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
      label: newFolderName.trim()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsCreating(false);
    
    toast({
      title: "Folder created",
      description: `Created folder: ${newFolder.label}`,
    });
  };

  return (
    <div className="space-y-2 min-w-[200px]">
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

      {isCreating ? (
        <div className="space-y-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setIsCreating(false);
            }}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="premium"
              className="flex-1"
              onClick={handleCreateFolder}
            >
              Create
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreating(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={() => setIsCreating(true)}
        >
          <FolderPlus className="h-4 w-4" />
          <span>New Folder</span>
        </Button>
      )}
    </div>
  );
};
