
import React from 'react';
import { Folder, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isFiltered?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered = false }) => {
  const handleUploadClick = () => {
    document.getElementById('file-upload-trigger')?.click();
  };
  
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium mb-2">No matching files found</h3>
        <p className="text-sm text-muted-foreground max-w-md text-center">
          Try adjusting your search criteria to find what you're looking for.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Folder className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Upload files to start sharing with this creator
      </p>
      <Button 
        onClick={handleUploadClick}
        variant="default"
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        <span>Upload Files</span>
      </Button>
    </div>
  );
};
