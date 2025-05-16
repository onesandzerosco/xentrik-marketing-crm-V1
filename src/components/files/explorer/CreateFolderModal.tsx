
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  isCategory?: boolean;
}

interface CreateFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedFileIds: string[];
  onSubmit: (e: React.FormEvent) => void;
  categories?: Folder[];
  isCategory?: boolean;
  setIsCategory?: (isCategory: boolean) => void;
  parentId?: string | null;
  setParentId?: (parentId: string | null) => void;
  title?: string;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onOpenChange,
  newFolderName,
  setNewFolderName,
  selectedFileIds,
  onSubmit,
  categories = [],
  isCategory = false,
  setIsCategory,
  parentId = null,
  setParentId,
  title = "Create New Folder"
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedFileIds.length > 0 
              ? `Create a new folder with ${selectedFileIds.length} selected files.` 
              : 'Enter a name for the new folder.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
                required
              />
            </div>
            
            {setIsCategory && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-category"
                  checked={isCategory}
                  onCheckedChange={(checked) => {
                    if (setIsCategory) setIsCategory(checked === true);
                    // Reset parent ID if this is a category
                    if (checked === true && setParentId) {
                      setParentId(null);
                    }
                  }}
                />
                <Label htmlFor="is-category">This is a category</Label>
              </div>
            )}
            
            {setParentId && !isCategory && categories.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="parent-category">Parent Category (Optional)</Label>
                <Select
                  value={parentId || ""}
                  onValueChange={(value) => setParentId(value === "" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Root Level)</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
