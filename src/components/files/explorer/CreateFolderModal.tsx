
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
import { Input } from '@/components/ui/input';
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

interface CreateFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryId: string;
  setSelectedCategoryId: (id: string) => void;
  availableCategories: Category[];
  handleSubmit: (e: React.FormEvent) => void;
  onCreate?: () => void;
  onCreateNewCategory?: () => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onOpenChange,
  newFolderName,
  setNewFolderName,
  selectedCategoryId,
  setSelectedCategoryId,
  availableCategories,
  handleSubmit,
  onCreate,
  onCreateNewCategory
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
    if (onCreate) onCreate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full">
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            Add a new folder to organize your files
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
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
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newFolderName.trim() || !selectedCategoryId}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
