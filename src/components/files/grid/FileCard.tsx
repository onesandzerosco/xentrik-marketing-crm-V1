
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CreatorFileType } from '@/types/fileTypes';
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File,
  MoreHorizontal,
  Download,
  Trash2,
  Pencil,
  FolderMinus,
  Tag,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useFilePermissions } from '@/utils/permissionUtils';
import { useContextMenu } from '@/context/context-menu';
import { useSelection } from '@/context/selection-context';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/utils/fileUtils';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => Promise<void>;
  isNewlyUploaded?: boolean;
  onSelectFiles?: (fileIds: string[]) => void;
  index?: number;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
  isSelectable?: boolean;
  isEditable?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({
  file,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  isNewlyUploaded = false,
  onSelectFiles,
  index,
  currentFolder = 'all',
  onRemoveFromFolder,
  onEditNote,
  onAddTag
}) => {
  const { toast } = useToast();
  const { canDelete, canEdit, canManageFolders } = useFilePermissions();
  const { selectedIds, toggleSelection, isSelected } = useSelection();
  const [isRemoving, setIsRemoving] = useState(false);
  const { menuState, openContextMenu, closeContextMenu } = useContextMenu();
  
  // Handle file selection - used for bulk operations
  const handleCardClick = () => {
    if (isCreatorView && onSelectFiles) {
      toggleSelection(file.id);
    }
  };
  
  // Get the right icon based on file type
  let Icon = File;
  if (file.type === 'image') Icon = FileImage;
  if (file.type === 'video') Icon = FileVideo;
  if (file.type === 'audio') Icon = FileAudio;
  if (file.type === 'document') Icon = FileText;
  
  // Determine file thumbnail
  const thumbUrl = file.thumbnail_url || file.url;
  const isImage = file.type === 'image';
  const isVideo = file.type === 'video';
  
  // Handle context menu (right-click)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const menuItems = [
      {
        label: 'Preview',
        onClick: () => window.open(file.url, '_blank', 'noopener,noreferrer'),
        icon: <Eye className="mr-2 h-4 w-4" />
      },
      {
        label: 'Download',
        onClick: () => {
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        icon: <Download className="mr-2 h-4 w-4" />
      }
    ];
    
    // Add conditional menu items based on permissions
    if (canEdit && onEditNote) {
      menuItems.push({
        label: 'Edit Note',
        onClick: () => onEditNote(file),
        icon: <Pencil className="mr-2 h-4 w-4" />
      });
    }
    
    if (canDelete) {
      menuItems.push({
        label: 'Delete',
        onClick: async () => {
          try {
            if (onFileDeleted) {
              await onFileDeleted(file.id);
            }
            toast({ 
              title: "File deleted", 
              description: `${file.name} has been deleted.`
            });
            onFilesChanged();
          } catch (error) {
            console.error('Error deleting file:', error);
            toast({ 
              title: "Error", 
              description: "Failed to delete file.", 
              variant: "destructive"
            });
          }
        },
        icon: <Trash2 className="mr-2 h-4 w-4" />
      });
    }
    
    if (canManageFolders && onRemoveFromFolder && 
        currentFolder !== 'all' && currentFolder !== 'unsorted') {
      menuItems.push({
        label: 'Remove from folder',
        onClick: async () => {
          try {
            setIsRemoving(true);
            await onRemoveFromFolder([file.id], currentFolder);
            toast({ 
              title: "File removed", 
              description: `Removed ${file.name} from folder.`
            });
            onFilesChanged();
          } catch (error) {
            console.error('Error removing file from folder:', error);
            toast({ 
              title: "Error", 
              description: "Failed to remove file from folder.", 
              variant: "destructive"
            });
            setIsRemoving(false);
          }
        },
        icon: <FolderMinus className="mr-2 h-4 w-4" />
      });
    }
    
    if (canEdit && onAddTag) {
      menuItems.push({
        label: 'Add tag',
        onClick: () => onAddTag(file),
        icon: <Tag className="mr-2 h-4 w-4" />
      });
    }
    
    openContextMenu({ event: e, items: menuItems });
  };
  
  // Skip rendering if the file is being removed from a folder
  if (isRemoving) return null;
  
  // Determine if the card should be selected
  const fileIsSelected = isSelected(file.id);
  const cardClasses = `cursor-pointer ${fileIsSelected ? 'ring-2 ring-primary' : ''}`;
  
  // Show placeholder if no thumbnail available
  const showPlaceholder = !thumbUrl || (!isImage && !isVideo);
  
  // Video preview component
  const VideoPreview = ({ src, poster }: { src: string, poster?: string }) => (
    <div className="relative h-32 bg-muted flex items-center justify-center overflow-hidden">
      <video 
        className="h-full w-full object-contain"
        src={src} 
        poster={poster}
        preload="metadata"
      />
      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
        <FileVideo className="h-12 w-12 text-white opacity-70" />
      </div>
    </div>
  );
  
  // Audio preview component
  const AudioPreview = () => (
    <div className="flex items-center justify-center h-32 bg-muted">
      <FileAudio className="h-16 w-16 text-muted-foreground" />
    </div>
  );
  
  // Document/other preview component
  const DocumentPreview = () => (
    <div className="flex items-center justify-center h-32 bg-muted">
      <Icon className="h-16 w-16 text-muted-foreground" />
    </div>
  );
  
  return (
    <Card 
      className={cardClasses}
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
    >
      {/* Thumbnail preview */}
      {isImage && thumbUrl ? (
        <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
          <img 
            src={thumbUrl} 
            alt={file.name} 
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      ) : isVideo ? (
        <VideoPreview src={file.url} poster={file.thumbnail_url} />
      ) : file.type === 'audio' ? (
        <AudioPreview />
      ) : (
        <DocumentPreview />
      )}
      
      <CardContent className="p-3">
        <div className="flex flex-col space-y-1">
          {/* File name with truncation */}
          <div className="flex justify-between items-start gap-1">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </p>
            </div>
            
            {/* More actions button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e);
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Description preview if available */}
          {file.description && (
            <p className="text-xs text-muted-foreground italic line-clamp-2" title={file.description}>
              "{file.description}"
            </p>
          )}
          
          {/* Tags & badges */}
          <div className="flex flex-wrap gap-1 pt-1">
            {file.type && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {file.type}
              </Badge>
            )}
            {isNewlyUploaded && (
              <Badge variant="secondary" className="text-xs px-1 py-0">
                New
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;
