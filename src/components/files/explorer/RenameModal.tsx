
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  currentName: string;
  setNewName: (name: string) => void;
  onConfirm: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  currentName,
  setNewName,
  onConfirm,
  isSubmitting = false
}) => {
  // This function handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(e); // Call the onConfirm function passed from parent
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Update the name
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="py-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                placeholder="Enter new name"
                value={currentName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!currentName.trim() || isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
