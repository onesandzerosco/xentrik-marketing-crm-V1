
import React, { useState } from 'react';
import { Folder, FolderPlus, X, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface FolderNavProps {
  activeFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export const FolderNav: React.FC<FolderNavProps> = ({ activeFolder, onFolderChange }) => {
  const [folders, setFolders] = useState<Array<{id: string, name: string}>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim()
    };
    
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsCreating(false);
    
    toast({
      title: "Folder created",
      description: `Created folder: ${newFolder.name}`,
    });
  };

  const cancelCreate = () => {
    setIsCreating(false);
    setNewFolderName('');
  };

  return (
    <div className="space-y-1 pr-1">
      <div className="py-2">
        <h3 className="px-3 text-xs font-medium text-muted-foreground">Folders</h3>
      </div>
      
      <Button
        variant={!activeFolder ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => onFolderChange(null)}
      >
        <Folder className="h-4 w-4 mr-2" />
        All Files
      </Button>
      
      {folders.map((folder) => (
        <Button
          key={folder.id}
          variant={activeFolder === folder.id ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start px-3 font-normal"
          onClick={() => onFolderChange(folder.id)}
        >
          <Folder className="h-4 w-4 mr-2" />
          {folder.name}
        </Button>
      ))}

      {isCreating ? (
        <div className="px-3 py-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="text-sm h-8 mb-2"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') cancelCreate();
            }}
          />
          <div className="flex gap-1 mt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7"
              onClick={handleCreateFolder}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-7"
              onClick={cancelCreate}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 font-normal text-muted-foreground"
          onClick={() => setIsCreating(true)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          New Folder
        </Button>
      )}
    </div>
  );
};
