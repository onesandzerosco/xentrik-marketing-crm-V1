
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
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { toast } = useToast();

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      if (customFolders.includes(newFolderName.trim())) {
        toast({
          title: "Folder already exists",
          description: "Please choose a different name",
          variant: "destructive",
        });
        return;
      }
      setCustomFolders([...customFolders, newFolderName.trim()]);
      setNewFolderName('');
      setIsCreatingFolder(false);
      toast({
        title: "Folder created",
        description: `Created folder "${newFolderName.trim()}"`,
      });
    }
  };

  return (
    <div className="space-y-2 w-full">
      <Button
        variant={!activeFolder ? "premium" : "ghost"}
        size="lg"
        className={`w-full justify-start gap-3 text-lg font-medium ${
          !activeFolder ? 'bg-brand-yellow text-black hover:bg-brand-yellow/90' : ''
        }`}
        onClick={() => onFolderChange(null)}
      >
        <Folder className="h-5 w-5" />
        <span>All Files</span>
      </Button>

      {customFolders.map((folder) => (
        <Button
          key={folder}
          variant={activeFolder === folder ? "secondary" : "ghost"}
          size="lg"
          className="w-full justify-start gap-3 text-lg"
          onClick={() => onFolderChange(folder)}
        >
          <Folder className="h-5 w-5" />
          <span>{folder}</span>
        </Button>
      ))}

      {isCreatingFolder ? (
        <div className="space-y-2">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="bg-secondary/5"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') setIsCreatingFolder(false);
            }}
          />
          <div className="flex gap-2">
            <Button 
              variant="premium" 
              size="sm" 
              className="flex-1"
              onClick={handleCreateFolder}
            >
              Create
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1"
              onClick={() => setIsCreatingFolder(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start gap-3 text-lg hover:bg-secondary/20"
          onClick={() => setIsCreatingFolder(true)}
        >
          <FolderPlus className="h-5 w-5" />
          <span>New Folder</span>
        </Button>
      )}
    </div>
  );
};
