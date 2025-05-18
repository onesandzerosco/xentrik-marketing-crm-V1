
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText, MoreVertical, Download, Trash2, Tag as TagIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFilePermissions } from '@/utils/permissionUtils';
import { CreatorFileType } from '@/types/fileTypes';
import { useContextMenu } from '@/context/context-menu';
import { useSelection } from '@/context/selection-context';
import { Badge } from '@/components/ui/badge';

interface FileCardProps {
  file: CreatorFileType;
  isSelectable?: boolean;
  isEditable?: boolean;
  isNewlyUploaded?: boolean;
  onDelete?: (fileId: string) => Promise<void>;
  onFilesChanged: () => void;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  isCreatorView?: boolean;
}

export function FileCard({ 
  file, 
  isSelectable = false,
  isEditable = false,
  isNewlyUploaded = false,
  onDelete,
  onFilesChanged,
  onEditNote,
  onAddTag,
  currentFolder = 'all',
  onRemoveFromFolder,
  isCreatorView = false
}: FileCardProps) {
  const { toast } = useToast();
  const { canDownload } = useFilePermissions();
  const { openContextMenu } = useContextMenu();
  const { isSelected, toggleSelection } = useSelection();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (!file.url) {
      toast({
        title: "Error",
        description: "File URL not available",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename || file.name || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSelectable) {
      toggleSelection(file.id);
    }
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    const menuItems = [
      canDownload && {
        label: 'Download',
        icon: <Download className="mr-2 h-4 w-4" />,
        onClick: handleDownload,
      },
      isEditable && onEditNote && {
        label: 'Edit Note',
        icon: <FileText className="mr-2 h-4 w-4" />,
        onClick: () => onEditNote(file)
      },
      isEditable && onAddTag && {
        label: 'Add Tag',
        icon: <TagIcon className="mr-2 h-4 w-4" />,
        onClick: () => onAddTag(file)
      },
      isEditable && onDelete && {
        label: 'Delete',
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick: () => {
          if (onDelete) {
            setIsDeleting(true);
            onDelete(file.id)
              .then(() => {
                toast({
                  title: "File Deleted",
                  description: "File deleted successfully.",
                });
                onFilesChanged();
              })
              .catch((error) => {
                console.error("Error deleting file:", error);
                toast({
                  title: "Error",
                  description: "There was an error deleting the file",
                  variant: "destructive",
                });
              })
              .finally(() => setIsDeleting(false));
          }
        },
        disabled: isDeleting,
      },
      isEditable && currentFolder !== 'all' && onRemoveFromFolder && {
        label: 'Remove from folder',
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick: () => {
          if (onRemoveFromFolder) {
            setIsDeleting(true);
            onRemoveFromFolder([file.id], currentFolder)
              .then(() => {
                toast({
                  title: "File Removed",
                  description: "File removed from folder successfully.",
                });
                onFilesChanged();
              })
              .catch((error) => {
                console.error("Error removing file:", error);
                toast({
                  title: "Error",
                  description: "There was an error removing the file from the folder",
                  variant: "destructive",
                });
              })
              .finally(() => setIsDeleting(false));
          }
        },
        disabled: isDeleting,
      }
    ].filter(Boolean);

    openContextMenu({
      event,
      items: menuItems
    });
  };

  return (
    <div
      className="group relative border bg-background rounded-lg overflow-hidden"
      onClick={handleFileClick}
      onContextMenu={handleContextMenu}
    >
      <div className="relative aspect-square overflow-hidden">
        {file.type?.startsWith('image/') ? (
          <img
            src={file.url}
            alt={file.name}
            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
          />
        ) : file.type?.startsWith('video/') ? (
          <video
            src={file.url}
            alt={file.name}
            className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
            muted
            loop
            autoPlay
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
            {file.type}
          </div>
        )}
        {isNewlyUploaded && (
          <div className="absolute top-0 left-0 w-full h-full bg-green-500/20 flex items-center justify-center text-green-500 text-2xl font-bold">
            New!
          </div>
        )}
        {isSelectable && (
          <div className={`absolute top-2 left-2 rounded-full bg-secondary text-secondary-foreground h-6 w-6 flex items-center justify-center ${isSelected(file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-50 transition-opacity duration-200'}`}>
            ✓
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2 flex space-x-1">
        {canDownload && (
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
        {isEditable && onAddTag && (
          <Button
            size="icon"
            variant="secondary"
            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onAddTag(file);
            }}
          >
            <TagIcon className="h-4 w-4" />
          </Button>
        )}
        {isEditable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuItems && menuItems.map((item: any, index: number) => (
                <DropdownMenuItem key={index} onClick={(e) => {
                  e.stopPropagation();
                  item.onClick(e);
                }} disabled={item.disabled}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className="p-2">
        <h3 className="text-sm font-medium truncate">{file.filename || file.name}</h3>
        <p className="text-xs text-muted-foreground">
          {file.file_size ? (file.file_size / 1024).toFixed(2) + ' KB' : 'N/A'}
        </p>
        {file.tags && file.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {file.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
