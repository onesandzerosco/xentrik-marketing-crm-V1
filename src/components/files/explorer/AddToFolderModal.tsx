
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
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
  onCreateNewFolder,
}) => {
  // Filter folders by selected category
  const filteredFolders = targetCategoryId
    ? customFolders.filter(folder => folder.categoryId === targetCategoryId)
    : [];
    
  // Reset target folder when category changes
  useEffect(() => {
    setTargetFolderId('');
  }, [targetCategoryId, setTargetFolderId]);

  const handleCreateNewFolderClick = () => {
    if (onCreateNewFolder && targetCategoryId) {
      // Close this modal
      onOpenChange(false);
      // Open the create folder modal with the selected category
      onCreateNewFolder();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Move {numSelectedFiles} selected {numSelectedFiles === 1 ? 'file' : 'files'} to a folder
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={targetCategoryId}
                onValueChange={setTargetCategoryId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={targetFolderId}
                onValueChange={setTargetFolderId}
                disabled={!targetCategoryId || filteredFolders.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    !targetCategoryId 
                      ? "Select a category first" 
                      : filteredFolders.length === 0 
                        ? "No folders in this category" 
                        : "Select folder"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredFolders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Add Create New Folder button */}
              {targetCategoryId && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={handleCreateNewFolderClick}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Folder
                </Button>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!targetFolderId || !targetCategoryId}
            >
              Add to Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
