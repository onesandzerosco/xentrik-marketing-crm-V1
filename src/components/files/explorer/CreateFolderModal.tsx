
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedFileIds: string[];
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onOpenChange,
  newFolderName,
  setNewFolderName,
  selectedFileIds,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new folder.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="py-4">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input 
              id="folderName" 
              value={newFolderName} 
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="My Folder"
              className="mt-2"
            />
            
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedFileIds.length > 0 ? (
                `${selectedFileIds.length} files will be added to this folder.`
              ) : (
                "No files selected. You can add files to this folder later."
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create Folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
