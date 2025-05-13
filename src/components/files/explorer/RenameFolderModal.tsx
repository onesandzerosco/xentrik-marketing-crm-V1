
import React from 'react';
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
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  onOpenChange,
  folderCurrentName,
  newFolderName,
  setNewFolderName,
  onSubmit,
  isSubmitting = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for the folder "{folderCurrentName}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
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
