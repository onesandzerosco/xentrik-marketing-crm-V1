
import React from 'react';
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
import { PlusCircle, FolderPlus } from 'lucide-react';
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
  onCreateNewCategory,
  onCreateNewFolder
}) => {
  // Filter folders based on selected category
  const filteredFolders = targetCategoryId
    ? customFolders.filter(folder => folder.categoryId === targetCategoryId)
    : [];
  
  // Reset folder selection when category changes
  React.useEffect(() => {
    if (filteredFolders.length > 0) {
      setTargetFolderId(filteredFolders[0].id);
    } else {
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
                disabled={!targetCategoryId}
              >
                <SelectTrigger id="folder-select">
                  <SelectValue placeholder={!targetCategoryId ? "Select a category first" : 
                    filteredFolders.length === 0 ? "No folders in this category" : "Select a folder"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                  
                  {onCreateNewFolder && targetCategoryId && (
                    <div className="px-2 py-1.5">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-sm" 
                        onClick={(e) => {
                          e.preventDefault();
                          onCreateNewFolder();
                        }}
                      >
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Create New Folder in This Category
                      </Button>
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
