
import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
  onCreateNewCategory?: () => void;
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
  onCreateNewCategory
}) => {
  // Filter folders based on selected category
  const filteredFolders = targetCategoryId
    ? customFolders.filter(folder => folder.categoryId === targetCategoryId)
    : [];
  
  // Reset folder selection when category changes
  useEffect(() => {
    if (targetCategoryId && filteredFolders.length > 0) {
      // Auto-select the first folder if available
      setTargetFolderId(filteredFolders[0].id);
    } else {
      // Clear the selected folder if no folders are available
      setTargetFolderId('');
    }
  }, [targetCategoryId, filteredFolders, setTargetFolderId]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            Move {numSelectedFiles} file{numSelectedFiles !== 1 ? 's' : ''} to a folder
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="category-select" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={targetCategoryId}
                onValueChange={setTargetCategoryId}
              >
                <SelectTrigger id="category-select">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  
                  {onCreateNewCategory && (
                    <div className="px-2 py-1.5">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          onCreateNewCategory();
                        }}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Category
                      </Button>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="folder-select" className="text-sm font-medium">
                Folder
              </label>
              <Select
                value={targetFolderId}
                onValueChange={setTargetFolderId}
                disabled={!targetCategoryId || filteredFolders.length === 0}
              >
                <SelectTrigger id="folder-select" className={filteredFolders.length === 0 ? "text-muted-foreground" : ""}>
                  <SelectValue placeholder={filteredFolders.length === 0 ? (targetCategoryId ? "No folders in this category" : "Select a category first") : "Select a folder"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                  {filteredFolders.length === 0 && targetCategoryId && (
                    <div className="px-4 py-2 text-sm text-muted-foreground">
                      No folders available in this category
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!targetCategoryId || !targetFolderId || numSelectedFiles === 0}
            >
              Add to Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
