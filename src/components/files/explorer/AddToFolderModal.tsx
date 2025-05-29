
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PlusCircle, Plus } from 'lucide-react';
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
  onCreateNewCategory?: () => void;
  onCreateCategory?: (name: string) => Promise<void>;
  onCreateFolder?: (name: string, categoryId: string) => Promise<void>;
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
  onCreateNewCategory,
  onCreateCategory,
  onCreateFolder,
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Filter folders by selected category
  const filteredFolders = targetCategoryId
    ? customFolders.filter(folder => folder.categoryId === targetCategoryId)
    : [];
    
  // Reset target folder when category changes
  useEffect(() => {
    setTargetFolderId('');
  }, [targetCategoryId, setTargetFolderId]);

  // Reset inputs when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowNewCategoryInput(false);
      setShowNewFolderInput(false);
      setNewCategoryName('');
      setNewFolderName('');
    }
  }, [isOpen]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !onCreateCategory) return;
    
    setIsCreatingCategory(true);
    try {
      await onCreateCategory(newCategoryName.trim());
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !targetCategoryId || !onCreateFolder) return;
    
    setIsCreatingFolder(true);
    try {
      await onCreateFolder(newFolderName.trim(), targetCategoryId);
      setShowNewFolderInput(false);
      setNewFolderName('');
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreatingFolder(false);
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
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Category</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCategoryInput(true)}
                  className="h-8 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  New Category
                </Button>
              </div>
              
              {showNewCategoryInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateCategory();
                      } else if (e.key === 'Escape') {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || isCreatingCategory}
                  >
                    {isCreatingCategory ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-muted-foreground italic p-2 border rounded">
                  No categories available. Create a category first.
                </div>
              ) : (
                <Select
                  value={targetCategoryId}
                  onValueChange={setTargetCategoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Folder</Label>
                {targetCategoryId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewFolderInput(true)}
                    className="h-8 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Folder
                  </Button>
                )}
              </div>
              
              {showNewFolderInput ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateFolder();
                      } else if (e.key === 'Escape') {
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim() || !targetCategoryId || isCreatingFolder}
                  >
                    {isCreatingFolder ? 'Creating...' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select
                  value={targetFolderId}
                  onValueChange={setTargetFolderId}
                  disabled={!targetCategoryId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      !targetCategoryId 
                        ? "Select a category first" 
                        : filteredFolders.length === 0 
                          ? "No folders in this category - create one" 
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
