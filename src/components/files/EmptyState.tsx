
import React from 'react';
import { Upload, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isFiltered?: boolean;
  isCreatorView?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFiltered = false, isCreatorView = false }) => {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No files found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          We couldn't find any files matching your search. Try using different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">No files yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        {isCreatorView 
          ? "You haven't uploaded any files yet. Click the Upload button to get started."
          : "There are no files in this folder. Check back later or contact the creator."}
      </p>
      {isCreatorView && (
        <Button 
          onClick={() => document.getElementById('file-upload-trigger')?.click()}
          variant="outline" 
          className="mt-4"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload files
        </Button>
      )}
    </div>
  );
};
