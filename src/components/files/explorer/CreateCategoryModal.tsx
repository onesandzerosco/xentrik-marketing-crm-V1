
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

interface CreateCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onCreate?: () => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onOpenChange,
  newCategoryName,
  setNewCategoryName,
  handleSubmit,
  onCreate
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
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your folders
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="py-4">
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newCategoryName.trim()}>
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
