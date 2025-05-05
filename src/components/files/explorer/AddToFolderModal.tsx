
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Folder {
  id: string;
  name: string;
}

interface AddToFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (folderId: string) => void;
  selectedFileIds: string[];
  customFolders: Folder[];
  onSubmit: (e: React.FormEvent) => void;
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onOpenChange,
  targetFolderId,
  setTargetFolderId,
  selectedFileIds,
  customFolders,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Select a folder to add the selected files to.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="py-4">
            <Label htmlFor="folderId">Select Folder</Label>
            <select 
              id="folderId" 
              value={targetFolderId} 
              onChange={(e) => setTargetFolderId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
            >
              <option value="">-- Select a folder --</option>
              {customFolders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
            
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedFileIds.length} files will be added to the selected folder.
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={!targetFolderId}>Add to Folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
