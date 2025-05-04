import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CreatorFileType } from '@/pages/CreatorFiles';
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
  UploadCloud,
  FolderPlus
} from 'lucide-react';
import { formatFileSize } from '@/utils/fileUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface FileGridProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  onUploadClick?: () => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
}

export const FileGrid: React.FC<FileGridProps> = ({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  onUploadClick,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleFileSelection = (fileId: string) => {
    setSelectedFileIds(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const isFileSelected = (fileId: string) => selectedFileIds.includes(fileId);

  const handleSelectAll = () => {
    if (selectedFileIds.length === files.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map(file => file.id));
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const fileToDelete = files.find(file => file.id === fileId);
      if (!fileToDelete) {
        toast({
          title: "File not found",
          description: "The file you're trying to delete does not exist.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.storage
        .from('raw_uploads')
        .remove([fileToDelete.bucketPath || '']);

      if (error) {
        console.error("Error deleting file:", error);
        toast({
          title: "Error deleting file",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Delete the file metadata from the media table
      const { error: mediaError } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);

      if (mediaError) {
        console.error("Error deleting file metadata:", mediaError);
        toast({
          title: "Error deleting file metadata",
          description: mediaError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "File deleted",
        description: "File deleted successfully.",
      });

      onFilesChanged();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error deleting file",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (onSelectFiles) {
      onSelectFiles(selectedFileIds);
    }
  }, [selectedFileIds, onSelectFiles]);

  const isAllSelected = selectedFileIds.length === files.length && files.length > 0;

  return (
    <div className="w-full">
      {/* Display action buttons when files are selected */}
      {selectedFileIds.length > 0 && isCreatorView && (
        <div className="mb-4 flex items-center gap-2">
          {onAddToFolderClick && (
            <Button variant="outline" onClick={onAddToFolderClick}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add {selectedFileIds.length} Files to Folder
            </Button>
          )}
          <Button variant="outline" onClick={() => {}}>
            <Download className="h-4 w-4 mr-2" />
            Download {selectedFileIds.length} Files
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {}}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedFileIds.length} Files
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Upload Card (only for creator view) */}
        {isCreatorView && onUploadClick && (
          <Card 
            className="h-52 border-dashed cursor-pointer hover:bg-accent/10 transition-colors"
            onClick={onUploadClick}
          >
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">Upload Files</p>
            </CardContent>
          </Card>
        )}

        {files.map((file) => {
          let Icon = File;
          if (file.type === 'image') Icon = FileImage;
          if (file.type === 'video') Icon = FileVideo;
          if (file.type === 'audio') Icon = FileAudio;
          if (file.type === 'document') Icon = FileText;

          const isNew = recentlyUploadedIds?.includes(file.id);

          return (
            <Card key={file.id} className="h-52">
              <CardContent className="p-6">
                <div className="flex flex-col h-full">
                  {isCreatorView && (
                    <div className="absolute top-2 right-2">
                      <Checkbox
                        checked={isFileSelected(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />
                    </div>
                  )}

                  <div className="flex-grow flex items-center justify-center">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-semibold truncate">{file.name}</h3>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>{file.type}</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                    {isNew && (
                      <span className="ml-1 rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
                        New
                      </span>
                    )}
                  </div>

                  {isCreatorView && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="absolute bottom-2 right-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteFile(file.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
