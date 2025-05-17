
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus } from 'lucide-react';
import { Folder, Category } from '@/types/fileTypes';

interface AddToFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  selectedFileIds: string[];
  customFolders: Folder[];
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCreateNewCategory: () => void;
  onCreateNewFolder: () => void;
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onOpenChange,
  targetFolderId,
  setTargetFolderId,
  selectedFileIds,
  customFolders,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  onSubmit,
  onCreateNewCategory,
  onCreateNewFolder
}) => {
  const [filteredFolders, setFilteredFolders] = useState<Folder[]>([]);
  
  // Update filtered folders when category selection changes
  useEffect(() => {
    if (selectedCategoryId) {
      setFilteredFolders(customFolders.filter(folder => folder.categoryId === selectedCategoryId));
    } else {
      setFilteredFolders([]);
    }
    // Reset folder selection when category changes
    setTargetFolderId('');
  }, [selectedCategoryId, customFolders, setTargetFolderId]);
  
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
            Choose a category and folder to add the {selectedFileIds.length} selected file{selectedFileIds.length !== 1 ? 's' : ''} to.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4 py-4">
            {/* Category Selection */}
            <div className="grid gap-2">
              <Label htmlFor="categorySelect">Select Category</Label>
              <div className="flex gap-2 items-center">
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger id="categorySelect">
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
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={onCreateNewCategory}
                  title="Create new category"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Folder Selection - only show if a category is selected */}
            {selectedCategoryId && (
              <div className="grid gap-2">
                <Label htmlFor="folderSelect">Select Folder</Label>
                <div className="flex gap-2 items-center">
                  <Select value={targetFolderId} onValueChange={setTargetFolderId}>
                    <SelectTrigger id="folderSelect" disabled={!selectedCategoryId}>
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={onCreateNewFolder}
                    disabled={!selectedCategoryId}
                    title="Create new folder in this category"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
