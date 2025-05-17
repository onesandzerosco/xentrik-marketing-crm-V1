
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { Category } from '@/types/fileTypes';

interface AddToFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  numSelectedFiles: number;
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  handleSubmit: (e: React.FormEvent) => void;
  onCreateNewFolder?: () => void;
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onOpenChange,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  numSelectedFiles,
  customFolders,
  categories,
  handleSubmit,
  onCreateNewFolder
}) => {
  // Filter folders based on the selected category
  const [filteredFolders, setFilteredFolders] = useState(customFolders);
  
  useEffect(() => {
    if (targetCategoryId) {
      setFilteredFolders(customFolders.filter(folder => folder.categoryId === targetCategoryId));
    } else {
      setFilteredFolders([]);
    }
  }, [targetCategoryId, customFolders]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="folder">Folder</Label>
              {targetCategoryId && onCreateNewFolder && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  type="button"
                  className="h-8 px-2 text-xs" 
                  onClick={onCreateNewFolder}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1" /> New Folder
                </Button>
              )}
            </div>
            <Select 
              value={targetFolderId} 
              onValueChange={setTargetFolderId}
              disabled={!targetCategoryId || filteredFolders.length === 0}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {filteredFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!targetCategoryId || !targetFolderId || numSelectedFiles === 0}
            >
              Add {numSelectedFiles} {numSelectedFiles === 1 ? 'File' : 'Files'} to Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
