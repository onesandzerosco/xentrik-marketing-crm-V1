import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreHorizontal, 
  Download, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FilePdf,
  FileArchive,
  FileCode,
  File 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { CreatorFileType } from '@/pages/CreatorFiles';

export interface FileListProps {
  files: CreatorFileType[];
  isCreatorView?: boolean;
  onFilesChanged: () => void;
  recentlyUploadedIds?: string[];
  onSelectFiles?: (fileIds: string[]) => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files,
  isCreatorView = false,
  onFilesChanged,
  recentlyUploadedIds = [],
  onSelectFiles
}) => {
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const { toast } = useToast();

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Link copied",
          description: "File link copied to clipboard.",
        });
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleDeleteFile = async () => {
    if (!fileToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { data, error } = await supabase
        .from('media')
        .delete()
        .eq('id', fileToDelete);
        
      if (error) throw error;
      
      toast({
        title: "File deleted",
        description: `Successfully deleted file`,
      });
      
      onFilesChanged();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error deleting file",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  const handleCheckboxChange = (fileId: string) => {
    const isSelected = selectedFileIds.includes(fileId);
    let newSelection: string[];
    
    if (isSelected) {
      newSelection = selectedFileIds.filter(id => id !== fileId);
    } else {
      newSelection = [...selectedFileIds, fileId];
    }
    
    setSelectedFileIds(newSelection);
    if (onSelectFiles) {
      onSelectFiles(newSelection);
    }
  };

  const isFileSelected = (fileId: string) => {
    return selectedFileIds.includes(fileId);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <FileImage className="h-4 w-4 mr-2 text-emerald-500" />;
      case 'video':
        return <FileVideo className="h-4 w-4 mr-2 text-violet-500" />;
      case 'audio':
        return <FileAudio className="h-4 w-4 mr-2 text-amber-500" />;
      case 'pdf':
        return <FilePdf className="h-4 w-4 mr-2 text-red-500" />;
      case 'archive':
        return <FileArchive className="h-4 w-4 mr-2 text-orange-500" />;
      case 'code':
        return <FileCode className="h-4 w-4 mr-2 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          {isCreatorView && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant="ghost" size="sm" className="p-0 h-auto w-auto">
                    <Checkbox
                      id="select-all"
                      checked={files.length > 0 && selectedFileIds.length === files.length}
                      indeterminate={selectedFileIds.length > 0 && selectedFileIds.length < files.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allFileIds = files.map(file => file.id);
                          setSelectedFileIds(allFileIds);
                          if (onSelectFiles) {
                            onSelectFiles(allFileIds);
                          }
                        } else {
                          setSelectedFileIds([]);
                          if (onSelectFiles) {
                            onSelectFiles([]);
                          }
                        }
                      }}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {files.length > 0 && selectedFileIds.length === files.length ? "Deselect All" : "Select All"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {files.length} files
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-950">
        {files.map((file) => {
          const isNew = recentlyUploadedIds?.includes(file.id);
          return (
            <div key={file.id} className="group flex items-center space-x-4 py-3 px-4 border-b last:border-b-0 dark:border-gray-800">
              {isCreatorView && (
                <Checkbox
                  checked={isFileSelected(file.id)}
                  onCheckedChange={() => handleCheckboxChange(file.id)}
                  id={`file-${file.id}`}
                  className="shrink-0"
                />
              )}
              
              <div className="flex items-center w-full">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {file.name}
                    {isNew && (
                      <CheckCircle2 className="inline-block h-3 w-3 ml-1 text-blue-500 align-top" />
                    )}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{file.type}</span>
                    <span className="mx-1">•</span>
                    <span>{file.size} KB</span>
                    <span className="mx-1">•</span>
                    <span>Uploaded {formatDistanceToNow(new Date(file.created_at || Date.now()), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" forceMount>
                  <DropdownMenuItem onClick={() => handleDownload(file.url, file.name)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyToClipboard(file.url)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  {isCreatorView && (
                    <DropdownMenuItem onClick={() => setFileToDelete(file.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFile}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
