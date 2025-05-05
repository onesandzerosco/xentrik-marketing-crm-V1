
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Folder {
  id: string;
  name: string;
}

interface AddToFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Choose a folder to add the {selectedFileIds.length} selected file{selectedFileIds.length !== 1 ? 's' : ''} to.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folderSelect">Select Folder</Label>
              <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                <SelectTrigger id="folderSelect">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  {customFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!targetFolderId}>
              Add to Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
