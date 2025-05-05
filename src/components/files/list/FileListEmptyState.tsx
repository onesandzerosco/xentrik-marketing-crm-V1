
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";

interface FileListEmptyStateProps {
  isCreatorView: boolean;
}

export const FileListEmptyState: React.FC<FileListEmptyStateProps> = ({
  isCreatorView
}) => {
  return (
    <TableRow>
      <TableCell colSpan={isCreatorView ? 6 : 5} className="text-center p-8">
        <div className="flex flex-col items-center justify-center py-6">
          <p className="text-muted-foreground mb-2">No files found in this folder.</p>
          {isCreatorView && (
            <p className="text-sm text-muted-foreground">
              Click the "Upload" button to add files.
            </p>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
