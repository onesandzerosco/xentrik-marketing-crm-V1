
import React, { useState } from 'react';
import { Folder, FolderPlus, X, Check, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Folder {
  id: string;
  name: string;
}

interface FolderNavProps {
  folders: Folder[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  activeFolder?: string | null;
  onCreateFolder?: (folderName: string) => void;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onInitiateNewFolder?: () => void; // Prop for initiating folder creation
}

// These are the default folder IDs that should not be deleted
const DEFAULT_FOLDERS = ['all', 'unsorted'];

export const FolderNav: React.FC<FolderNavProps> = ({ 
  folders = [], 
  currentFolder, 
  onFolderChange,
  activeFolder = null,
  onCreateFolder,
  onDeleteFolder,
  onInitiateNewFolder
}) => {
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  const handleDeleteFolder = async () => {
    if (!folderToDelete || !onDeleteFolder) return;
    
    setIsDeleting(true);
    
    try {
      await onDeleteFolder(folderToDelete);
      
      toast({
        title: "Folder deleted",
        description: `Successfully deleted folder`,
      });
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast({
        title: "Error deleting folder",
        description: error instanceof Error ? error.message : "Failed to delete folder",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setFolderToDelete(null);
    }
  };
  
  const handleCreateFolderClick = () => {
    if (onInitiateNewFolder) {
      onInitiateNewFolder();
    } else {
      // If there's no handler, show the warning
      setShowWarning(true);
    }
  };

  // Separate default folders from custom folders
  const defaultFolders = folders.filter(folder => DEFAULT_FOLDERS.includes(folder.id));
  const customFolders = folders.filter(folder => !DEFAULT_FOLDERS.includes(folder.id));

  return (
    <div className="space-y-1 pr-1">
      <div className="py-2">
        <h3 className="px-3 text-xs font-medium text-muted-foreground">Folders</h3>
      </div>
      
      <Button
        variant={!activeFolder ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => onFolderChange('all')}
      >
        <Folder className="h-4 w-4 mr-2" />
        All Files
      </Button>
      
      <Button
        variant={currentFolder === 'unsorted' ? "secondary" : "ghost"}
        size="sm"
        className="w-full justify-start px-3 font-normal"
        onClick={() => onFolderChange('unsorted')}
      >
        <Folder className="h-4 w-4 mr-2" />
        Unsorted Uploads
      </Button>
      
      {customFolders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Custom Folders</h3>
          
          {customFolders.map((folder) => (
            <div key={folder.id} className="flex items-center group">
              <Button
                variant={currentFolder === folder.id ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start px-3 font-normal"
                onClick={() => onFolderChange(folder.id)}
              >
                <Folder className="h-4 w-4 mr-2" />
                {folder.name}
              </Button>
              
              {onDeleteFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 -ml-8 h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(folder.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-3 font-normal text-muted-foreground mt-4"
        onClick={handleCreateFolderClick}
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        Create Folder
      </Button>

      {/* Warning Dialog - No Files Selected */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Files Selected</DialogTitle>
            <DialogDescription>
              Please select at least 1 file to create a folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWarning(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <AlertDialog open={!!folderToDelete} onOpenChange={(open) => !open && setFolderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the folder. Files within this folder will not be deleted, but they will no longer be associated with this folder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFolder}
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
