
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AddPlatformFormProps {
  newPlatformName: string;
  setNewPlatformName: (name: string) => void;
  onAdd: () => void;
  onCancel: () => void;
}

const AddPlatformForm: React.FC<AddPlatformFormProps> = ({
  newPlatformName,
  setNewPlatformName,
  onAdd,
  onCancel
}) => {
  return (
    <div className="border rounded-lg p-4 bg-muted/30 border-dashed">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Add New Platform</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter platform name (e.g., LinkedIn, YouTube)"
            value={newPlatformName}
            onChange={(e) => setNewPlatformName(e.target.value)}
            className="rounded-[15px] border-muted-foreground/20"
          />
          <Button 
            onClick={onAdd} 
            className="rounded-[15px]"
            disabled={!newPlatformName.trim()}
          >
            Add
          </Button>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="rounded-[15px]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPlatformForm;
