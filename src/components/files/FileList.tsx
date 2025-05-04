import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  Download,
  Trash2,
  FolderPlus,
  FolderMinus
} from 'lucide-react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
  onAddToFolderClick?: () => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  isCreatorView = false,
  onFilesChanged,
  recentlyUploadedIds = [],
  onSelectFiles,
  onAddToFolderClick,
  currentFolder = 'all',
  onRemoveFromFolder
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  // Show remove from folder button only in custom folders (not in 'all' or 'unsorted')
  const showRemoveFromFolder = currentFolder !== 'all' && currentFolder !== 'unsorted';

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

  const handleRemoveFromFolder = async () => {
    if (!showRemoveFromFolder || !onRemoveFromFolder || selectedFileIds.length === 0) {
      return;
    }
    
    try {
      await onRemoveFromFolder(selectedFileIds, currentFolder);
      
      toast({
        title: "Files removed from folder",
        description: `Successfully removed ${selectedFileIds.length} files from this folder`,
      });
      
      setSelectedFileIds([]);
    } catch (error) {
      console.error("Error removing files from folder:", error);
      toast({
        title: "Error",
        description: "Failed to remove files from folder",
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
    <div className="w-full relative overflow-x-auto">
      {selectedFileIds.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          {onAddToFolderClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddToFolderClick}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              Add {selectedFileIds.length} Files to Folder
            </Button>
          )}
          
          {showRemoveFromFolder && onRemoveFromFolder && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveFromFolder}
            >
              <FolderMinus className="h-4 w-4 mr-2" />
              Remove {selectedFileIds.length} Files from Folder
            </Button>
          )}
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              {isCreatorView && (
                <Checkbox
                  checked={isAllSelected}
                  aria-label="Select all"
                  onCheckedChange={handleSelectAll}
                />
              )}
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date Added</TableHead>
            {isCreatorView && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            let Icon = File;
            if (file.type === 'image') Icon = FileImage;
            if (file.type === 'video') Icon = FileVideo;
            if (file.type === 'audio') Icon = FileAudio;
            if (file.type === 'document') Icon = FileText;

            const isNew = recentlyUploadedIds?.includes(file.id);

            return (
              <TableRow key={file.id}>
                <TableCell className="font-medium">
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
                    {file.name}
                    {isNew && (
                      <span className="ml-1 rounded-md bg-secondary text-xs text-secondary-foreground px-2 py-0.5">
                        New
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{file.type}</TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDate(file.created_at)}</TableCell>
                {isCreatorView && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      
                      {showRemoveFromFolder && onRemoveFromFolder && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={async () => {
                            try {
                              await onRemoveFromFolder([file.id], currentFolder);
                              toast({
                                title: "File removed",
                                description: `Removed ${file.name} from folder`,
                              });
                              onFilesChanged();
                            } catch (error) {
                              console.error("Error removing file from folder:", error);
                              toast({
                                title: "Error",
                                description: "Failed to remove file from folder",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <FolderMinus className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
          {files.length === 0 && (
            <TableRow>
              <TableCell colSpan={isCreatorView ? 6 : 5} className="text-center">
                No files found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
