
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Tag, Check, Palette } from 'lucide-react';
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
import { ColorPicker } from './ColorPicker';

interface TagSelectorProps {
  tags: FileTag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (name: string) => Promise<FileTag | null>;
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

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  onTagCreate,
  disabled = false,
  variant = 'default',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#87CEFA'); // Default blue color

  const getBadgeStyle = (color?: string) => {
    if (!color) return '';
    
    // Simple color style logic based on hex value
    const style = { 
      backgroundColor: color, 
      color: isLightColor(color) ? '#333333' : '#ffffff' 
    };
    
    return style;
  };
  
  // Helper function to determine if a color is light (needs dark text) or dark (needs light text)
  const isLightColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // If brightness > 150, it's a light color
    return brightness > 150;
  };

  const handleCreateTag = async () => {
    if (newTagName.trim() && onTagCreate) {
      await onTagCreate(newTagName);
      setNewTagName('');
      setIsDialogOpen(false);
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
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1 px-1 font-normal">
              {selectedTags.length}
            </Badge>
          )}
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
                  onSelect={() => onTagSelect(tag.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge style={getBadgeStyle(tag.color)}>
                      {tag.name}
                    </Badge>
                  </div>
                  {selectedTags.includes(tag.id) && (
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
                      
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="color">Color</Label>
                          <Palette className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <ColorPicker 
                          selectedColor={selectedColor} 
                          onColorSelect={setSelectedColor} 
                        />
                        <div className="mt-2">
                          <Badge className="text-sm" style={getBadgeStyle(selectedColor)}>
                            Preview: {newTagName || 'Tag Name'}
                          </Badge>
                        </div>
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
