
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
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
  FolderMinus,
  Pencil,
  Eye
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
  const { canDelete, canEdit, canManageFolders } = useFilePermissions();
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
    if (!onRemoveFromFolder || !canManageFolders) return;
    
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

  // Add debugging info for video thumbnails
  React.useEffect(() => {
    if (file.type === 'video') {
      console.log(`File ${file.name} thumbnail URL:`, file.thumbnail_url);
    }
  }, [file]);

  return (
    <TableRow key={file.id} className={isCreatorView ? "cursor-pointer" : ""}>
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
      {/* File actions column */}
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end gap-1 flex-wrap">
          {/* Preview button - available for all users */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(file.url, '_blank', 'noopener,noreferrer');
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Download button - available for all users */}
          <a href={file.url} download={file.name}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
            </Button>
          </a>
          
          {/* Edit description button - available for creators and VAs */}
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
          
          {/* Delete button - only for creators */}
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
          
          {/* Remove from folder button - only for creators and VAs */}
          {showRemoveFromFolder && onRemoveFromFolder && canManageFolders && (
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
    </TableRow>
  );
};
