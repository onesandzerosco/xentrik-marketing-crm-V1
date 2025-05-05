
import React from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { 
  TableCell, 
  TableRow
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  Download,
  Trash2,
  FolderPlus,
  FolderMinus,
  Pencil
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useToast } from "@/components/ui/use-toast";

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
  onFileDeleted?: (fileId: string) => void;
  onFilesChanged: () => void;
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
  onFilesChanged
}) => {
  const { toast } = useToast();
  const { canDelete, canEdit } = useFilePermissions();
  const [isRemoving, setIsRemoving] = React.useState(false);
  
  // Determine which icon to show based on file type
  let Icon = File;
  if (file.type === 'image') Icon = FileImage;
  if (file.type === 'video') Icon = FileVideo;
  if (file.type === 'audio') Icon = FileAudio;
  if (file.type === 'document') Icon = FileText;
  
  // Handle removing a file from folder
  const handleRemoveFromFolderClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemoveFromFolder) return;
    
    try {
      setIsRemoving(true);
      
      if (onFileDeleted && currentFolder !== 'all' && currentFolder !== 'unsorted') {
        onFileDeleted(file.id); // Optimistically update UI
      }
      
      await onRemoveFromFolder([file.id], currentFolder);
      
      toast({
        title: "File removed",
        description: `Removed ${file.name} from folder`,
      });
      
      setIsRemoving(false);
      onFilesChanged(); // Refresh in background
    } catch (error) {
      console.error("Error removing file from folder:", error);
      setIsRemoving(false);
      
      toast({
        title: "Error",
        description: "Failed to remove file from folder",
        variant: "destructive",
      });
    }
  };

  // Skip rendering files being removed from folder when in folder view
  if (isRemoving && currentFolder !== 'all' && currentFolder !== 'unsorted') return null;

  return (
    <TableRow key={file.id} className={isCreatorView ? "cursor-pointer" : ""} onClick={() => isCreatorView && handleFileClick(file)}>
      <TableCell className="font-medium" onClick={(e) => e.stopPropagation()}>
        {isCreatorView && (
          <Checkbox
            checked={isFileSelected(file.id)}
            onCheckedChange={() => toggleFileSelection(file.id)}
          />
        )}
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="truncate max-w-[200px]">{file.name}</span>
          {file.isNewlyUploaded && (
            <span className="ml-1 rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
              New
            </span>
          )}
        </div>
        {file.description && (
          <div className="text-xs text-muted-foreground italic truncate max-w-[200px] mt-1">
            "{file.description}"
          </div>
        )}
      </TableCell>
      <TableCell>{file.type}</TableCell>
      <TableCell>{formatFileSize(file.size)}</TableCell>
      <TableCell>{formatDate(file.created_at)}</TableCell>
      {isCreatorView && (
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-end gap-1 flex-wrap">
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </a>
            
            {canDelete && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(file.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            {onEditNote && canEdit && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNote(file);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            
            {showRemoveFromFolder && onRemoveFromFolder && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={handleRemoveFromFolderClick}
              >
                <FolderMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
