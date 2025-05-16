
import React, { useState, useMemo } from 'react';
import { Folder, FolderPlus, Trash2, Pencil, ChevronRight, ChevronDown, FolderOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
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
import { useFilePermissions } from '@/utils/permissionUtils';

interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  isCategory?: boolean;
}

interface FolderNavProps {
  folders: Folder[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  activeFolder?: string | null;
  onInitiateNewFolder?: () => void; // Prop for initiating folder creation
  onDeleteFolder?: (folderId: string) => Promise<void>; // Updated to Promise<void>
  onRenameFolder?: (folderId: string, currentName: string) => Promise<void>; // New prop for renaming a folder
  onCreateCategory?: () => void; // New prop for creating a category
  onCreateSubfolder?: (parentId: string) => void; // New prop for creating a subfolder
}

// These are the default folder IDs that should not be deleted or renamed
const DEFAULT_FOLDERS = ['all', 'unsorted'];

export const FolderNav: React.FC<FolderNavProps> = ({ 
  folders = [], 
  currentFolder, 
  onFolderChange,
  activeFolder = null,
  onInitiateNewFolder,
  onDeleteFolder,
  onRenameFolder,
  onCreateCategory,
  onCreateSubfolder
}) => {
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Add permission check for showing folder management buttons
  const { canManageFolders } = useFilePermissions();

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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Organize folders into categories and subfolders
  const { defaultFolders, categories, subfolders } = useMemo(() => {
    const defaults = folders.filter(folder => DEFAULT_FOLDERS.includes(folder.id));
    const cats = folders.filter(folder => 
      !DEFAULT_FOLDERS.includes(folder.id) && 
      folder.isCategory === true &&
      !folder.parentId
    );
    const subs = folders.filter(folder => 
      !DEFAULT_FOLDERS.includes(folder.id) && 
      (folder.isCategory === false || folder.isCategory === undefined) || 
      folder.parentId
    );
    
    return {
      defaultFolders: defaults,
      categories: cats,
      subfolders: subs
    };
  }, [folders]);

  // Render a folder item with management buttons
  const renderFolderItem = (folder: Folder, indentLevel: number = 0) => {
    const isCategory = folder.isCategory === true;
    const isExpanded = expandedCategories.includes(folder.id);
    const hasChildren = subfolders.some(sub => sub.parentId === folder.id);
    
    return (
      <div key={folder.id} style={{ paddingLeft: `${indentLevel * 12}px` }} className="mb-1">
        <div className="flex items-center group">
          {isCategory && hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 mr-1"
              onClick={() => toggleCategory(folder.id)}
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          ) : (
            <div className="w-7 mr-1"></div>
          )}
          
          <Button
            variant={currentFolder === folder.id ? "secondary" : "ghost"}
            size="sm"
            className={`w-full justify-start px-2 font-normal ${isCategory ? 'font-medium' : ''}`}
            onClick={() => onFolderChange(folder.id)}
          >
            {isCategory ? 
              <FolderOpen className="h-4 w-4 mr-2" /> : 
              <Folder className="h-4 w-4 mr-2" />
            }
            {folder.name}
            
            {isCategory && (
              <div className="ml-auto opacity-0 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCreateSubfolder) onCreateSubfolder(folder.id);
                  }}
                  title="Create subfolder"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </Button>
              </div>
            )}
          </Button>
          
          {/* Only show management buttons if user has permission and not default folders */}
          {canManageFolders && !DEFAULT_FOLDERS.includes(folder.id) && (
            <div className="opacity-0 group-hover:opacity-100 flex -ml-16 space-x-1">
              {/* Rename button */}
              {onRenameFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameFolder(folder.id, folder.name);
                  }}
                  title="Rename folder"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                </Button>
              )}
              
              {/* Delete button */}
              {onDeleteFolder && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFolderToDelete(folder.id);
                  }}
                  title="Delete folder"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Render child folders if this is an expanded category */}
        {isCategory && isExpanded && (
          <div className="mt-1">
            {subfolders
              .filter(sub => sub.parentId === folder.id)
              .map(subFolder => renderFolderItem(subFolder, indentLevel + 1))
            }
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1 pr-1">
      <div className="py-2">
        <h3 className="px-3 text-xs font-medium text-muted-foreground">Folders</h3>
      </div>
      
      {/* Default system folders */}
      {defaultFolders.map(folder => (
        <Button
          key={folder.id}
          variant={currentFolder === folder.id ? "secondary" : "ghost"}
          size="sm"
          className="w-full justify-start px-3 font-normal"
          onClick={() => onFolderChange(folder.id)}
        >
          <Folder className="h-4 w-4 mr-2" />
          {folder.id === 'all' ? 'All Files' : 'Unsorted Uploads'}
        </Button>
      ))}
      
      {/* Categories section with their subfolders */}
      {categories.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <h3 className="px-3 text-xs font-medium text-muted-foreground mb-2">Categories</h3>
          {categories.map(category => renderFolderItem(category))}
        </div>
      )}

      {/* Create folder buttons */}
      <div className="mt-4 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 font-normal text-muted-foreground"
          onClick={onCreateCategory || handleCreateFolderClick}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Category
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-3 font-normal text-muted-foreground"
          onClick={handleCreateFolderClick}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
      </div>

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
