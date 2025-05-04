import React from 'react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Edit } from 'lucide-react';
import { FileDownloader } from './FileDownloader';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { formatDistanceToNow } from 'date-fns';
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FileGridProps {
  files: (CreatorFileType & { isHighlighted?: boolean })[];
  selectedFiles: CreatorFileType[];
  onFileSelect: (file: CreatorFileType, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditDescription?: (file: CreatorFileType) => void;
  showDownloadAction?: boolean;
  showDeleteAction?: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onEditDescription,
  showDownloadAction = true,
  showDeleteAction = false,
}) => {
  const allSelected = files.length > 0 && files.length === selectedFiles.length;
  
  const getFileIcon = (file: CreatorFileType) => {
    if (file.type === 'image') {
      return (
        <img 
          src={file.url} 
          alt={file.name} 
          className="h-full w-full object-cover"
        />
      );
    } else if (file.type === 'video') {
      // Show thumbnail if available, otherwise a placeholder
      return file.thumbnail_url ? (
        <div className="relative h-full w-full">
          <img 
            src={file.thumbnail_url} 
            alt={file.name} 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <FileText size={48} className="text-muted-foreground" />
        </div>
      );
    } else {
      return (
        <div className="flex h-full items-center justify-center">
          <FileText size={48} className="text-muted-foreground" />
        </div>
      );
    }
  };

  const handleCardClick = (file: CreatorFileType) => {
    if (file.type === 'video' && file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {allSelected ? 'Deselect All' : 'Select All'}
          </label>
        </div>
        <div className="text-sm text-muted-foreground">
          {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {files.map((file) => {
          const isSelected = selectedFiles.some(f => f.id === file.id);
          
          return (
            <Card 
              key={file.id} 
              className={`overflow-hidden transition-all ${
                file.isHighlighted ? 'ring-2 ring-primary' : ''
              } ${isSelected ? 'bg-muted' : ''}`}
            >
              <div className="absolute left-2 top-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onFileSelect(file, !!checked)}
                />
              </div>

              <div 
                className="h-40 relative cursor-pointer"
                onClick={() => handleCardClick(file)}
              >
                {getFileIcon(file)}
              </div>

              <CardContent className="p-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium truncate text-sm" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-muted-foreground" title={new Date(file.created_at).toLocaleString()}>
                    {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                  </p>
                  {file.description && (
                    <p className="text-xs mt-1 border-t pt-1 border-border">
                      {file.description}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-2 pt-0 flex justify-between">
                <div className="flex gap-1">
                  {showDownloadAction && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                            <FileDownloader files={[file]}>
                              <Download className="h-4 w-4" />
                            </FileDownloader>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {showDeleteAction && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onFileSelect(file, true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                {onEditDescription && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          className="h-7 w-7" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditDescription(file);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Description</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FileGrid;
