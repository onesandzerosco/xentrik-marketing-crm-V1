
import React, { useState } from 'react';
import Image from 'next/image';
import { CreatorFileType } from '@/types/fileTypes';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  Download, 
  Trash2, 
  Pencil, 
  FolderMinus,
  Eye 
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { cn } from '@/lib/utils';
import { VideoThumbnail } from './VideoThumbnail';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFileClick: (file: CreatorFileType) => void;
  onDeleteFile: () => void;
  onRemoveFromFolder?: () => void;
  onEditNote?: (file: CreatorFileType) => void;
  isDeleting?: boolean;
  isRemoving?: boolean;
  isSelected?: boolean;
  isNew?: boolean;
  showRemoveFromFolder?: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canManageFolders?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isCreatorView,
  onFileClick,
  onDeleteFile,
  onRemoveFromFolder,
  onEditNote,
  isDeleting = false,
  isRemoving = false,
  isSelected = false,
  isNew = false,
  showRemoveFromFolder = false,
  canDelete,
  canEdit,
  canManageFolders = false
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  // Determine which icon to show based on file type
  let Icon = File;
  if (file.type === 'image') Icon = FileImage;
  if (file.type === 'video') Icon = FileVideo;
  if (file.type === 'audio') Icon = FileAudio;
  if (file.type === 'document') Icon = FileText;
  
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  
  return (
    <Card 
      className={cn(
        "min-h-[220px] flex flex-col group transition-all border",
        isHovering ? "border-primary/30" : "border-border",
        isSelected && "border-primary border-2 shadow-md",
        (isDeleting || isRemoving) && "opacity-50"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CardHeader className="p-3 pb-0 flex-row justify-between items-center space-y-0">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium truncate max-w-[150px]">
            {file.name}
          </CardTitle>
        </div>
        {isNew && (
          <span className="rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
            New
          </span>
        )}
      </CardHeader>
      
      <CardContent 
        className="p-3 flex-1 flex items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={() => onFileClick(file)}
      >
        {file.type === 'image' ? (
          <div className="relative h-full w-full max-h-[120px] flex items-center justify-center overflow-hidden">
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>
        ) : file.type === 'video' ? (
          <VideoThumbnail file={file} />
        ) : (
          <div 
            className="flex items-center justify-center h-full"
            style={{ minHeight: '70px' }}
          >
            <Icon className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        
        {/* Show description as tooltip if available */}
        {file.description && (
          <div className="absolute bottom-0 left-0 right-0 bg-background/90 p-2 text-xs truncate opacity-0 group-hover:opacity-100 transition-opacity">
            "{file.description}"
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex-col items-stretch gap-2">
        <div className="w-full text-xs text-muted-foreground flex justify-between">
          <span>{formatFileSize(file.size)}</span>
          <span>{formatDate(file.created_at)}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-0">
          {/* Preview button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              window.open(file.url, '_blank', 'noopener,noreferrer');
            }}
            title="Preview file"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          {/* Download button */}
          <a href={file.url} download={file.name}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => e.stopPropagation()}
              title="Download file"
            >
              <Download className="h-4 w-4" />
            </Button>
          </a>
          
          {/* Edit description button - only for creators and VAs */}
          {onEditNote && canEdit && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onEditNote(file);
              }}
              title="Edit description"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          
          {/* Delete button - only for creators */}
          {isCreatorView && canDelete && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFile();
              }}
              disabled={isDeleting}
              title="Delete file"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          {/* Remove from folder button - for creators and VAs */}
          {showRemoveFromFolder && onRemoveFromFolder && canManageFolders && (
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFromFolder();
              }}
              disabled={isRemoving}
              title="Remove from folder"
            >
              <FolderMinus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
