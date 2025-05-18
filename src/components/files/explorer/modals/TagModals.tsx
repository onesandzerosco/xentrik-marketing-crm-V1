
import React, { useEffect, useState } from 'react';
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
import { FileTag } from '@/hooks/useFileTags';

interface AddTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  availableTags: FileTag[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  availableTags,
  onTagSelect,
  onTagCreate
}) => {
  const [newTagName, setNewTagName] = useState('');
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Add tags to {selectedFileIds.length} selected {selectedFileIds.length === 1 ? 'file' : 'files'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="tag">Select Existing Tag</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableTags.map((tag) => (
                <Button 
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  className={`py-1 px-2 rounded-full border-2 border-${tag.color}-500 hover:bg-${tag.color}-100`}
                  onClick={() => onTagSelect(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
          
          {onTagCreate && (
            <div className="space-y-2">
              <Label htmlFor="newTag">Create New Tag</Label>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Enter tag name"
                />
                <Button 
                  type="button"
                  disabled={!newTagName.trim()}
                  onClick={async () => {
                    if (newTagName.trim()) {
                      try {
                        const newTag = await onTagCreate(newTagName);
                        onTagSelect(newTag.id); // Auto-select the newly created tag
                        setNewTagName('');
                      } catch (error) {
                        console.error('Error creating new tag:', error);
                      }
                    }
                  }}
                >
                  Create & Add
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
