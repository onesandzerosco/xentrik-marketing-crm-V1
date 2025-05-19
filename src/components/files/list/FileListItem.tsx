
import React, { useState } from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Trash2, 
  Download, 
  Eye, 
  Pencil,
  FolderMinus,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatFileSize, formatDate } from '@/utils/fileUtils';

interface FileListItemProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  isFileSelected: (fileId: string) => boolean;
  toggleFileSelection: (fileId: string) => void;
  handleFileClick: (file: CreatorFileType) => void;
  handleDeleteFile: (fileId: string) => void;
  showRemoveFromFolder: boolean;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  currentFolder: string;
  onEditNote?: (file: CreatorFileType) => void;
  onFileDeleted: (fileId: string) => void;
  onFilesChanged: () => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({
  file,
  isCreatorView,
  isFileSelected,
  toggleFileSelection,
  handleFileClick,
  handleDeleteFile,
  showRemoveFromFolder,
  onRemoveFromFolder,
  currentFolder,
  onEditNote,
  onFileDeleted,
  onFilesChanged,
  onAddTagToFile
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const selected = isFileSelected(file.id);
  
  const deleteFile = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteFile(file.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <TableRow className={selected ? "bg-muted/50" : ""}>
      <TableCell>
        {isCreatorView && (
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={selected}
            onChange={() => toggleFileSelection(file.id)}
          />
        )}
      </TableCell>
      <TableCell>
        <div className="font-medium">{file.name}</div>
        {file.description && (
          <div className="text-sm text-muted-foreground">{file.description}</div>
        )}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {file.tags.map(tagId => (
              <span key={tagId} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {tagId}
              </span>
            ))}
          </div>
        )}
      </TableCell>
      <TableCell>{file.type}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{formatDate(file.created_at)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={file.url} download={file.name}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </a>
            </DropdownMenuItem>
            
            {isCreatorView && onEditNote && (
              <DropdownMenuItem onClick={() => onEditNote(file)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Note
              </DropdownMenuItem>
            )}
            
            {isCreatorView && onAddTagToFile && (
              <DropdownMenuItem onClick={() => onAddTagToFile(file)}>
                <Tag className="mr-2 h-4 w-4" />
                Add Tag
              </DropdownMenuItem>
            )}
            
            {showRemoveFromFolder && onRemoveFromFolder && (
              <DropdownMenuItem 
                onClick={() => onRemoveFromFolder([file.id], currentFolder)}
              >
                <FolderMinus className="mr-2 h-4 w-4" />
                Remove from Folder
              </DropdownMenuItem>
            )}
            
            {isCreatorView && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={deleteFile}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
