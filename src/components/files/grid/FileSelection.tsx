
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface FileSelectionProps {
  fileId: string;
  isSelected: boolean;
  onToggleSelection: (fileId: string) => void;
}

export const FileSelection: React.FC<FileSelectionProps> = ({ 
  fileId, 
  isSelected, 
  onToggleSelection 
}) => {
  return (
    <div className="absolute top-2 right-2 z-10">
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggleSelection(fileId)}
        className="bg-background/80"
      />
    </div>
  );
};
