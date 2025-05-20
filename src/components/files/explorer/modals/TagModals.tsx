
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
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AddTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  availableTags: FileTag[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  onTagRemove?: (tagName: string, fileId: string) => Promise<void>;
  singleFileName?: string;
  currentFileTags?: string[];
  singleFileId?: string;
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  availableTags,
  onTagSelect,
  onTagCreate,
  onTagRemove,
  singleFileName,
  currentFileTags = [],
  singleFileId
}) => {
  const [newTagName, setNewTagName] = useState('');
  const { toast } = useToast();
  
  // Clear input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setNewTagName('');
    }
  }, [isOpen]);
  
  const handleCreateAndAddTag = async () => {
    if (!newTagName.trim() || !onTagCreate) return;
    
    try {
      const newTag = await onTagCreate(newTagName);
      onTagSelect(newTag.id); // Auto-select the newly created tag
      setNewTagName('');
      
      toast({
        title: "Tag created",
        description: `Tag "${newTagName}" was created successfully.`,
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error creating tag",
        description: "There was a problem creating the tag.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveTag = async (tagName: string) => {
    if (!onTagRemove || !singleFileId) return;
    
    try {
      await onTagRemove(tagName, singleFileId);
      toast({
        title: "Tag removed",
        description: `Tag "${tagName}" was removed successfully.`,
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error removing tag",
        description: "There was a problem removing the tag.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-full">
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            {singleFileName 
              ? `Add tags to file: "${singleFileName}"`
              : `Add tags to ${selectedFileIds.length} selected ${selectedFileIds.length === 1 ? 'file' : 'files'}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Current tags section */}
          {singleFileId && currentFileTags && currentFileTags.length > 0 && (
            <div className="space-y-2">
              <Label>Current Tags</Label>
              <div className="flex flex-wrap gap-2">
                {currentFileTags.map((tagName) => (
                  <Badge 
                    key={tagName} 
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {tagName}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tagName)}
                      className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tagName} tag</span>
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
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
                  onClick={handleCreateAndAddTag}
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
