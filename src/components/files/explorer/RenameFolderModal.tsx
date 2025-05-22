
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RenameFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folderCurrentName: string;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  folderToRename?: string | null;
  setFolderToRename?: (id: string | null) => void;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  onOpenChange,
  folderCurrentName,
  newFolderName,
  setNewFolderName,
  onSubmit,
  isSubmitting = false,
  folderToRename,
  setFolderToRename
}) => {
  // Set initial value when the modal opens
  useEffect(() => {
    if (isOpen && folderCurrentName) {
      setNewFolderName(folderCurrentName);
    }
  }, [isOpen, folderCurrentName, setNewFolderName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Create a global function that other components can call to open the modal
  useEffect(() => {
    // Define the function directly on window object
    window.openRenameFolderModal = (folderId: string, currentName: string) => {
      console.log("Folder modal function called with:", folderId, currentName);
      if (setFolderToRename) {
        setFolderToRename(folderId);
      }
      setNewFolderName(currentName);
      onOpenChange(true);
    };
    
    return () => {
      window.openRenameFolderModal = undefined;
    };
  }, [setNewFolderName, onOpenChange, setFolderToRename]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for the folder "{folderCurrentName}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter new folder name"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!newFolderName.trim() || isSubmitting}
            >
              {isSubmitting ? "Renaming..." : "Rename Folder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
