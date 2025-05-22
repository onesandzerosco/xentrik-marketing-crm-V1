
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
import { X } from 'lucide-react';

interface AddTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  availableTags: FileTag[];
  onTagSelect: (tagName: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  onTagRemove?: (tagName: string) => void;
  singleFileName?: string;
  fileTags?: string[];
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
  fileTags = []
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
      onTagSelect(newTag.name); // Select by name instead of id
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

  const handleRemoveTag = (tagName: string) => {
    if (onTagRemove) {
      onTagRemove(tagName);
      toast({
        title: "Tag removed",
        description: `Tag "${tagName}" was removed successfully.`,
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
          {/* Display existing tags with remove option */}
          {fileTags && fileTags.length > 0 && (
            <div>
              <Label>Current Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {fileTags.map((tag) => (
                  <div 
                    key={tag} 
                    className="flex items-center bg-gray-100 text-gray-800 py-1 px-3 rounded-full"
                  >
                    {tag}
                    {onTagRemove && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-1 hover:bg-gray-200 rounded-full"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
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
                  onClick={() => onTagSelect(tag.name)}
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
