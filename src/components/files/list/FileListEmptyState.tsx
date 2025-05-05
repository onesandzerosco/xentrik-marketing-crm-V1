
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
      <TableCell colSpan={isCreatorView ? 6 : 5} className="text-center">
        No files found.
      </TableCell>
    </TableRow>
  );
};
