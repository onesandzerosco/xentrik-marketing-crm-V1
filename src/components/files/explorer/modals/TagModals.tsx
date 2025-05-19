
import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { FileTag } from '@/hooks/useFileTags';

interface AddTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  availableTags: FileTag[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  singleFileName?: string;
  isLoading?: boolean;
}

// Tag color mapping
const tagColors: Record<string, string> = {
  'red': 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100',
  'amber': 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100',
  'green': 'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
  'blue': 'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
  'gray': 'border-gray-500 bg-gray-50 text-gray-700 hover:bg-gray-100',
  'purple': 'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100',
  'pink': 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100',
};

export const AddTagModal: React.FC<AddTagModalProps> = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  availableTags,
  onTagSelect,
  onTagCreate,
  singleFileName,
  isLoading = false
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onTagCreate) return;
    
    setIsCreatingTag(true);
    try {
      const newTag = await onTagCreate(newTagName);
      onTagSelect(newTag.id); // Auto-select the newly created tag
      setNewTagName('');
    } catch (error) {
      console.error('Error creating new tag:', error);
    } finally {
      setIsCreatingTag(false);
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
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div>
                <Label htmlFor="tag">Select Existing Tag</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No tags available. Create one below.</div>
                  ) : (
                    availableTags.map((tag) => (
                      <Button 
                        key={tag.id}
                        variant="outline"
                        size="sm"
                        className={`py-1 px-3 rounded-full border border-2 ${tagColors[tag.color] || tagColors.gray}`}
                        onClick={() => onTagSelect(tag.id)}
                      >
                        {tag.name}
                      </Button>
                    ))
                  )}
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
                      disabled={isCreatingTag}
                    />
                    <Button 
                      type="button"
                      disabled={!newTagName.trim() || isCreatingTag}
                      onClick={handleCreateTag}
                      className={isCreatingTag ? 'opacity-70' : ''}
                    >
                      {isCreatingTag ? 'Creating...' : 'Create & Add'}
                    </Button>
                  </div>
                </div>
              )}
            </>
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

export interface TagBadgeProps {
  tag: FileTag;
  onDelete?: () => void;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onDelete }) => {
  const colorClass = tagColors[tag.color] || tagColors.gray;
  
  return (
    <Badge className={`${colorClass} flex items-center gap-1`}>
      {tag.name}
      {onDelete && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1 hover:bg-red-100 rounded-full p-0.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </Badge>
  );
};
