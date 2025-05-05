
import React from 'react';
import {
  TableHead,
  TableRow,
  TableHeader
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface FileListHeaderProps {
  isCreatorView: boolean;
  isAllSelected: boolean;
  handleSelectAll: () => void;
}

export const FileListHeader: React.FC<FileListHeaderProps> = ({
  isCreatorView,
  isAllSelected,
  handleSelectAll
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]">
          {isCreatorView && (
            <Checkbox
              checked={isAllSelected}
              aria-label="Select all"
              onCheckedChange={handleSelectAll}
            />
          )}
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Date Added</TableHead>
        {isCreatorView && <TableHead className="text-right">Actions</TableHead>}
      </TableRow>
    </TableHeader>
  );
};
