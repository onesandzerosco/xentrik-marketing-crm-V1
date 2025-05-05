
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFileClick: (file: CreatorFileType) => void;
  onDeleteFile: (fileId: string) => void;
  onEditNote?: (file: CreatorFileType) => void;
  onRemoveFromFolder?: (fileId: string) => void;
  isDeleting: boolean;
  isRemoving: boolean;
  isSelected: boolean;
  isNew: boolean;
  showRemoveFromFolder: boolean;
  canDelete: boolean;
  canEdit: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isCreatorView,
  onFileClick,
  onDeleteFile,
  onEditNote,
  onRemoveFromFolder,
  isDeleting,
  isRemoving,
  isSelected,
  isNew,
  showRemoveFromFolder,
  canDelete,
  canEdit
}) => {
  let Icon = File;
  if (file.type === 'image') Icon = FileImage;
  if (file.type === 'video') Icon = FileVideo;
  if (file.type === 'audio') Icon = FileAudio;
  if (file.type === 'document') Icon = FileText;

  // Ensure thumbnail URLs are being used if they exist
  const hasThumbnail = file.type === 'video' && file.thumbnail_url;

  return (
    <Card className={`overflow-hidden h-full flex flex-col ${isNew ? 'border-2 border-green-500' : ''}`}>
      <div className="relative">
        {/* Thumbnail container that fills the available space */}
        <div 
          className="relative h-40 w-full"
        >
          {/* Default icon shown when no thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          
          {/* Actual image or video thumbnail overlay */}
          {file.type === 'image' && file.url && (
            <img
              src={file.url}
              alt={file.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {hasThumbnail && (
            <img
              src={file.thumbnail_url}
              alt={file.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                console.error("Error loading thumbnail:", file.thumbnail_url);
                // Hide the broken image on error
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          
          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
            {/* Preview button - available for all users */}
            <Button 
              variant="secondary" 
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
                variant="secondary" 
                size="icon" 
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4" />
              </Button>
            </a>
            
            {/* Edit description button - available for creators and VAs */}
            {canEdit && onEditNote && (
              <Button 
                variant="secondary" 
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
                variant="secondary" 
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            
            {/* Remove from folder button - for users with canManageFolders permission */}
            {showRemoveFromFolder && onRemoveFromFolder && canEdit && (
              <Button 
                variant="secondary" 
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromFolder(file.id);
                }}
              >
                <FolderMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <div className="mt-1 text-sm font-medium truncate">{file.name}</div>
        <div className="text-xs text-muted-foreground">
          {formatFileSize(file.size)} - {formatDate(file.created_at)}
        </div>
        {file.description && (
          <div className="mt-1 text-xs text-muted-foreground italic truncate">
            "{file.description}"
          </div>
        )}
      </CardContent>
      
      {isCreatorView && (
        <CardFooter className="p-3 pt-0 mt-auto">
          {isDeleting && <span className="text-xs text-muted-foreground">Deleting...</span>}
          {isRemoving && <span className="text-xs text-muted-foreground">Removing...</span>}
          {!isDeleting && !isRemoving && isSelected && (
            <span className="text-xs text-brand-yellow font-medium">Selected</span>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
