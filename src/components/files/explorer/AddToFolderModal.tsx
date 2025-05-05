
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  // Filter out system folders (they should already be filtered in customFolders prop,
  // but adding this as a safeguard)
  const availableFolders = customFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Select a folder to add the selected files to.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="py-4">
            <Label htmlFor="folderId">Select Folder</Label>
            
            {availableFolders.length > 0 ? (
              <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="-- Select a folder --" />
                </SelectTrigger>
                <SelectContent>
                  {availableFolders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="mt-2 p-3 bg-muted rounded-md text-center text-sm">
                No custom folders available. Please create a folder first.
              </div>
            )}
            
            <div className="mt-4 text-sm text-muted-foreground">
              {selectedFileIds.length} files will be added to the selected folder.
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={!targetFolderId || availableFolders.length === 0}>Add to Folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
