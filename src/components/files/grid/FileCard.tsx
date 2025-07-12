
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Edit, 
  Tag, 
  FolderMinus, 
  FileText, 
  Image, 
  Video, 
  Music, 
  File,
  Menu
} from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFileClick: (file: CreatorFileType) => void;
  onDeleteFile?: () => void;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTagToFile?: (file: CreatorFileType) => void;
  onRemoveFromFolder?: () => void;
  isDeleting?: boolean;
  isRemoving?: boolean;
  isSelected?: boolean;
  isNew?: boolean;
  showRemoveFromFolder?: boolean;
  canDelete?: boolean;
  canEdit?: boolean;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isCreatorView,
  onFileClick,
  onDeleteFile,
  onEditNote,
  onAddTagToFile,
  onRemoveFromFolder,
  isDeleting = false,
  isRemoving = false,
  isSelected = false,
  isNew = false,
  showRemoveFromFolder = false,
  canDelete = false,
  canEdit = false
}) => {
  const isMobile = useIsMobile();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (mimeType.startsWith('video/')) return <Video className="h-6 w-6" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-6 w-6" />;
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="h-6 w-6" />;
    return <File className="h-6 w-6" />;
  };

  const getPreviewImage = () => {
    if (file.thumbnail_url) {
      return file.thumbnail_url;
    }
    if (file.type?.startsWith('image/')) {
      return `https://rdzwpiokpyssqhnfiqrt.supabase.co/storage/v1/object/public/creator-files/${file.bucketPath}`;
    }
    return null;
  };

  const previewImage = getPreviewImage();

  return (
    <div className="relative">
      {/* Action Buttons positioned above the card - centered but not constrained */}
      {isCreatorView && (
        <div className={`
          absolute -top-12 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-200
          ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
          {isMobile ? (
            // Mobile: Show menu button with dropdown
            <div className="relative group/actions">
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 bg-card/95 hover:bg-card border border-border shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <Menu className="h-4 w-4 text-foreground" />
              </Button>
              
              {/* Mobile actions dropdown */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-card rounded-lg shadow-lg border border-border p-1 opacity-0 group-hover/actions:opacity-100 transition-opacity duration-200 z-30 min-w-[120px]">
                {onEditNote && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditNote(file);
                    }}
                    className="w-full justify-start h-8 px-2 text-xs text-foreground hover:bg-muted"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                )}
                
                {onAddTagToFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTagToFile(file);
                    }}
                    className="w-full justify-start h-8 px-2 text-xs text-foreground hover:bg-muted"
                  >
                    <Tag className="h-3 w-3 mr-2" />
                    Tag
                  </Button>
                )}
                
                {showRemoveFromFolder && onRemoveFromFolder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromFolder();
                    }}
                    className="w-full justify-start h-8 px-2 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                  >
                    <FolderMinus className="h-3 w-3 mr-2" />
                    Remove
                  </Button>
                )}
                
                {canDelete && onDeleteFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFile();
                    }}
                    className="w-full justify-start h-8 px-2 text-xs text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Desktop: Show individual buttons in a row
            <div className="flex items-center justify-center gap-1 bg-card/95 backdrop-blur-sm rounded-lg shadow-md border border-border p-1">
              {onEditNote && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(file);
                  }}
                  className="h-8 w-8 text-foreground hover:bg-muted hover:text-foreground"
                  title="Edit note"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {onAddTagToFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTagToFile(file);
                  }}
                  className="h-8 w-8 text-foreground hover:bg-muted hover:text-foreground"
                  title="Add tag"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              )}
              
              {showRemoveFromFolder && onRemoveFromFolder && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromFolder();
                  }}
                  className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                  title="Remove from folder"
                >
                  <FolderMinus className="h-4 w-4" />
                </Button>
              )}
              
              {canDelete && onDeleteFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile();
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  title="Delete file"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      <Card 
        className={`
          relative group hover:shadow-md transition-all duration-200 cursor-pointer
          ${isSelected ? 'ring-2 ring-primary' : ''} 
          ${isNew ? 'ring-2 ring-green-500' : ''} 
          ${isDeleting || isRemoving ? 'opacity-50' : ''}
          ${isMobile ? 'h-auto' : 'h-48'}
        `}
        onClick={() => onFileClick(file)}
      >
        <CardContent className={`p-2 ${isMobile ? 'p-3' : 'p-4'} h-full flex flex-col`}>
          {/* File Preview */}
          <div className={`
            relative flex-shrink-0 rounded-md overflow-hidden bg-muted flex items-center justify-center
            ${isMobile ? 'h-24 mb-2' : 'h-32 mb-3'}
          `}>
            {previewImage ? (
              <img 
                src={previewImage} 
                alt={file.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`flex items-center justify-center text-muted-foreground ${previewImage ? 'hidden' : ''}`}>
              {getFileIcon(file.type || '')}
            </div>
          </div>

          {/* File Info */}
          <div className="flex-1 min-h-0">
            <h3 className={`font-medium text-foreground line-clamp-2 mb-1 ${isMobile ? 'text-sm' : 'text-sm'}`}>
              {file.name}
            </h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
              {formatFileSize(file.size)}
            </p>
            
            {file.description && (
              <p className={`text-muted-foreground line-clamp-2 mt-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
                {file.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
