
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
  Eye,
  Tag
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFileClick: (file: CreatorFileType) => void;
  onDeleteFile: (fileId: string) => void;
  onEditNote?: (file: CreatorFileType) => void;
  onRemoveFromFolder?: (fileId: string) => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
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
  onAddTagToFile,
  isDeleting,
  isRemoving,
  isSelected,
  isNew,
  showRemoveFromFolder,
  canDelete,
  canEdit
}) => {
  const isMobile = useIsMobile();
  
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
        <div className={`relative w-full ${isMobile ? 'h-32' : 'h-40'}`}>
          {/* Default icon shown when no thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <Icon className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground`} />
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
          <div className={`absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center ${
            isMobile ? 'gap-0.5' : 'gap-1'
          } transition-opacity`}>
            {/* Preview button - available for all users */}
            <Button 
              variant="secondary" 
              size="icon" 
              className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
              onClick={(e) => {
                e.stopPropagation();
                window.open(file.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <Eye className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
            
            {/* Download button - available for all users */}
            <Button 
              variant="secondary" 
              size="icon" 
              className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
              onClick={(e) => {
                e.stopPropagation();
                // Create a temporary anchor element for download
                const link = document.createElement('a');
                link.href = file.url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
            
            {/* Add Tag button - available for creators and admins */}
            {canEdit && onAddTagToFile && (
              <Button 
                variant="secondary" 
                size="icon"
                className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTagToFile(file);
                }}
              >
                <Tag className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
              </Button>
            )}
            
            {/* Edit description button - available for creators and VAs */}
            {canEdit && onEditNote && (
              <Button 
                variant="secondary" 
                size="icon"
                className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditNote(file);
                }}
              >
                <Pencil className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
              </Button>
            )}
            
            {/* Delete button - only for creators */}
            {canDelete && (
              <Button 
                variant="secondary" 
                size="icon"
                className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
              >
                <Trash2 className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
              </Button>
            )}
            
            {/* Remove from folder button - for users with canManageFolders permission */}
            {showRemoveFromFolder && onRemoveFromFolder && canEdit && (
              <Button 
                variant="secondary" 
                size="icon"
                className={isMobile ? 'h-6 w-6' : 'h-8 w-8'}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFromFolder(file.id);
                }}
              >
                <FolderMinus className={isMobile ? 'h-3 w-3' : 'h-4 w-4'} />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <CardContent className={`${isMobile ? 'p-2' : 'p-4'} flex-grow`}>
        <div className={`${isMobile ? 'mt-0.5' : 'mt-1'} ${isMobile ? 'text-xs' : 'text-sm'} font-medium truncate`}>
          {file.name}
        </div>
        <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
          {formatFileSize(file.size)} - {formatDate(file.created_at)}
        </div>
        {file.description && (
          <div className={`${isMobile ? 'mt-0.5' : 'mt-1'} ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground italic truncate`}>
            "{file.description}"
          </div>
        )}
        {file.tags && file.tags.length > 0 && (
          <div className={`${isMobile ? 'mt-0.5' : 'mt-1'} flex flex-wrap gap-1`}>
            {file.tags.map(tagId => (
              <span 
                key={tagId} 
                className={`inline-flex items-center px-1.5 py-0.5 rounded ${isMobile ? 'text-xs' : 'text-xs'} font-medium bg-blue-100 text-blue-800`}
              >
                {tagId}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      
      {isCreatorView && (
        <CardFooter className={`${isMobile ? 'p-2 pt-0' : 'p-3 pt-0'} mt-auto`}>
          {isDeleting && <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>Deleting...</span>}
          {isRemoving && <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground`}>Removing...</span>}
          {!isDeleting && !isRemoving && isSelected && (
            <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-brand-yellow font-medium`}>Selected</span>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
