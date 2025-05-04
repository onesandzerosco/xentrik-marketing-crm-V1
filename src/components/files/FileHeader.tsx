
import React from 'react';
import { Button } from "@/components/ui/button";

interface FileHeaderProps {
  creatorName: string;
  onUploadClick?: () => void;
  isCreatorView?: boolean;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ 
  creatorName, 
  isCreatorView = false,
}) => {
  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{creatorName}'s Files</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize files
          </p>
        </div>
      </div>
    </div>
  );
};
