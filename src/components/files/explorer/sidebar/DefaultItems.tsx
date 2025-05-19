
import React from 'react';
import { Button } from "@/components/ui/button";

interface DefaultItemsProps {
  currentFolder: string;
  currentCategory: string | null;
  onFolderChange: (folderId: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
}

export const DefaultItems: React.FC<DefaultItemsProps> = ({
  currentFolder,
  currentCategory,
  onFolderChange,
  onCategoryChange
}) => {
  return (
    <div className="space-y-1">
      <Button
        variant={currentFolder === 'all' ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => {
          onCategoryChange(null);
          onFolderChange('all');
        }}
      >
        All Files
      </Button>
      
      <Button
        variant={currentFolder === 'unsorted' ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => {
          onCategoryChange(null);
          onFolderChange('unsorted');
        }}
      >
        Unsorted Uploads
      </Button>
    </div>
  );
};
