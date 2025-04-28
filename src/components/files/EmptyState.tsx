
import React from 'react';
import { Folder } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">No files uploaded yet</p>
      <p className="text-sm text-muted-foreground mt-1">
        Upload files using the button above
      </p>
    </div>
  );
};
