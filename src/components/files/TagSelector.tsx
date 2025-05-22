
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Tag, Check } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileTag } from '@/hooks/useFileTags';

interface TagSelectorProps {
  tags: FileTag[];
  selectedTags: string[];
  onTagSelect: (tagName: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag>;
  disabled?: boolean;
  variant?: 'default' | 'compact';
}

const tagColors: Record<string, string> = {
  'red': 'bg-red-100 text-red-800 hover:bg-red-200',
  'amber': 'bg-amber-100 text-amber-800 hover:bg-amber-200',
  'green': 'bg-green-100 text-green-800 hover:bg-green-200',
  'blue': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'gray': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  'purple': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'pink': 'bg-pink-100 text-pink-800 hover:bg-pink-200',
};

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  onTagCreate,
  disabled = false,
  variant = 'default',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  console.log("TagSelector received tags:", tags);
  console.log("TagSelector selected tags:", selectedTags);

  // Helper to get selected tag names for display
  const getSelectedTagsDisplay = () => {
    if (selectedTags.length === 0) return null;
    
    // Just show count for compact view
    return (
      <Badge variant="secondary" className="ml-1 px-1 font-normal">
        {selectedTags.length}
      </Badge>
    );
  };

  const handleCreateTag = async () => {
    if (newTagName.trim() && onTagCreate) {
      try {
        await onTagCreate(newTagName);
        setNewTagName('');
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error creating tag:", error);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size={variant === 'compact' ? 'sm' : 'default'} 
          className="border-dashed flex gap-2" 
          disabled={disabled}
        >
          <Tag className="h-4 w-4" />
          <span>Tags</span>
          {getSelectedTagsDisplay()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {tags.map(tag => (
                <CommandItem
                  key={tag.id}
                  onSelect={() => onTagSelect(tag.name)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge className={tagColors[tag.color] || tagColors.gray}>
                      {tag.name}
                    </Badge>
                  </div>
                  {selectedTags.includes(tag.name) && (
                    <Check className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {onTagCreate && (
              <CommandGroup>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm pl-2"
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create new tag
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create new tag</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter tag name..."
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" onClick={handleCreateTag}>
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default TagSelector;
