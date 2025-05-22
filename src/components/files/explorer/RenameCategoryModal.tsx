
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameCategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryCurrentName: string;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  categoryToRename?: string | null;
  setCategoryToRename?: (id: string | null) => void;
}

export const RenameCategoryModal: React.FC<RenameCategoryModalProps> = ({
  isOpen,
  onOpenChange,
  categoryCurrentName,
  newCategoryName,
  setNewCategoryName,
  onSubmit,
  categoryToRename,
  setCategoryToRename
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Create a global function that other components can call to open the modal
  useEffect(() => {
    window.openRenameCategoryModal = (categoryId: string, currentName: string) => {
      if (setCategoryToRename) {
        setCategoryToRename(categoryId);
      }
      setNewCategoryName(currentName);
      onOpenChange(true);
    };
    
    return () => {
      window.openRenameCategoryModal = undefined;
    };
  }, [setNewCategoryName, onOpenChange, setCategoryToRename]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Rename Category</DialogTitle>
          <DialogDescription>
            Update the name of this category
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">New Category Name</Label>
              <Input
                id="categoryName"
                placeholder="Enter new category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!newCategoryName.trim()}>
              Rename Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
