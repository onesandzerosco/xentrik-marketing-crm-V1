
import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { FileHeader } from './FileHeader';
import { FileList } from './FileList';
import { FileGrid } from './FileGrid';
import { FileViewSkeleton } from './FileViewSkeleton';
import { EmptyState } from './EmptyState';
import { FilterBar } from './FilterBar';
import { FilterButtons } from './FilterButtons';
import { FolderNav } from './FolderNav';
import DragDropUploader from './DragDropUploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FolderPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploaderWithProgress from './FileUploaderWithProgress';
import { FileDownloader } from './FileDownloader';
import { useAuth } from '@/context/AuthContext';
import { canDeleteFiles } from '@/utils/permissionUtils';

interface Folder {
  id: string;
  name: string;
}

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folder: string) => void;
  currentFolder: string;
  availableFolders: Folder[];
  isCreatorView?: boolean;
  onUploadComplete?: (uploadedFileIds?: string[]) => Promise<void> | void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder?: (folderName: string, fileIds: string[]) => Promise<void>; 
  onAddFilesToFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  availableFolders,
  isCreatorView = false,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRemoveFromFolder
}) => {
  // Changed default to 'grid' instead of 'list'
  const [view, setView] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showAddToFolderDialog, setShowAddToFolderDialog] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string>('');
  const { toast } = useToast();
  const { userRole, userRoles } = useAuth();
  const canDelete = canDeleteFiles(userRole, userRoles);
  
  // Local state for optimistic UI updates
  const [localFiles, setLocalFiles] = useState<CreatorFileType[]>(files);
  
  // New folder creation states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isFolderCreating, setIsFolderCreating] = useState(false);
  const [addFolderDialogTab, setAddFolderDialogTab] = useState('existing');
  const [newFolderInDialog, setNewFolderInDialog] = useState('');
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  
  // Update local files when props files change
  React.useEffect(() => {
    setLocalFiles(files);
  }, [files]);
  
  const filteredFiles = localFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleUploadClick = () => {
    const fileInput = document.getElementById('direct-file-upload');
    if (fileInput) {
      if (onUploadStart) {
        onUploadStart();
      }
      fileInput.click();
    }
  };
  
  const handleUploadComplete = (uploadedFileIds?: string[]) => {
    if (onUploadComplete) {
      onUploadComplete(uploadedFileIds);
    }
    onRefresh();
  };
  
  const handleFilesChanged = () => {
    // No longer immediately triggering a refresh - we'll update the UI optimistically
    // and let the underlying refresh happen in the background
    onRefresh();
  };

  const handleInitiateNewFolder = () => {
    // Check if there are files selected - if not, show warning
    if (selectedFiles.length === 0) {
      setShowWarningDialog(true);
      return;
    }
    
    // Clear previous inputs and show the dialog
    setNewFolderName('');
    setShowNewFolderDialog(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || selectedFiles.length === 0) {
      toast({
        title: "Invalid folder creation",
        description: selectedFiles.length === 0 
          ? "Please select at least one file for the new folder." 
          : "Please enter a folder name.",
        variant: "destructive",
      });
      return;
    }

    setIsFolderCreating(true);
    
    try {
      // Optimistically update UI
      const folderId = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
      const updatedFolders = [
        ...availableFolders,
        { id: folderId, name: newFolderName.trim() }
      ];
      
      // Update the UI to show the files are now in the new folder
      const updatedFiles = localFiles.map(file => {
        if (selectedFiles.includes(file.id)) {
          return {
            ...file,
            folderRefs: [...(file.folderRefs || []), folderId]
          };
        }
        return file;
      });
      
      setLocalFiles(updatedFiles);
      
      if (onCreateFolder) {
        // Run the actual operation in the background
        await onCreateFolder(newFolderName.trim(), selectedFiles);
      }
      
      setShowNewFolderDialog(false);
      setNewFolderName('');
      setSelectedFiles([]);
      
      toast({
        title: "Folder created",
        description: `Successfully created folder with ${selectedFiles.length} files`,
      });
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error creating folder",
        description: "Failed to create the new folder",
        variant: "destructive",
      });
    } finally {
      setIsFolderCreating(false);
    }
  };

  const handleFileSelection = (fileIds: string[]) => {
    setSelectedFiles(fileIds);
  };

  const handleAddToFolder = async () => {
    if (addFolderDialogTab === 'existing') {
      // Add to existing folder
      if (!targetFolder || selectedFiles.length === 0) {
        return;
      }

      try {
        // Optimistically update UI
        const updatedFiles = localFiles.map(file => {
          if (selectedFiles.includes(file.id)) {
            const folderRefs = [...(file.folderRefs || [])];
            if (!folderRefs.includes(targetFolder)) {
              folderRefs.push(targetFolder);
            }
            return {
              ...file,
              folderRefs
            };
          }
          return file;
        });
        
        setLocalFiles(updatedFiles);
        
        if (onAddFilesToFolder) {
          // Run the actual operation in the background
          await onAddFilesToFolder(selectedFiles, targetFolder);
        }
        
        setShowAddToFolderDialog(false);
        setSelectedFiles([]);
        setTargetFolder('');
        
        toast({
          title: "Files added to folder",
          description: `Successfully added ${selectedFiles.length} files to folder`,
        });
      } catch (error) {
        console.error("Error adding files to folder:", error);
        toast({
          title: "Error adding files to folder",
          description: "Failed to add files to the selected folder",
          variant: "destructive",
        });
        
        // Revert the optimistic update on error
        onRefresh();
      }
    } else {
      // Create new folder from dialog
      if (!newFolderInDialog.trim() || selectedFiles.length === 0) {
        toast({
          title: "Invalid folder creation",
          description: "Please enter a folder name.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Optimistically update UI
        const folderId = newFolderInDialog.trim().toLowerCase().replace(/\s+/g, '-');
        
        const updatedFiles = localFiles.map(file => {
          if (selectedFiles.includes(file.id)) {
            return {
              ...file,
              folderRefs: [...(file.folderRefs || []), folderId]
            };
          }
          return file;
        });
        
        setLocalFiles(updatedFiles);
        
        if (onCreateFolder) {
          // Run the actual operation in the background
          await onCreateFolder(newFolderInDialog.trim(), selectedFiles);
        }
        
        setShowAddToFolderDialog(false);
        setNewFolderInDialog('');
        setSelectedFiles([]);
        
        toast({
          title: "Folder created",
          description: `Successfully created folder with ${selectedFiles.length} files`,
        });
      } catch (error) {
        console.error("Error creating folder:", error);
        toast({
          title: "Error creating folder",
          description: "Failed to create the new folder",
          variant: "destructive",
        });
        
        // Revert the optimistic update on error
        onRefresh();
      }
    }
  };

  const handleBulkDownload = () => {
    if (selectedFiles.length === 0) return;
    
    const filesToDownload = files.filter(file => selectedFiles.includes(file.id));
    
    // Dispatch a custom event for the FileDownloader to handle
    const event = new CustomEvent('fileDownloadRequest', {
      detail: { files: filesToDownload }
    });
    window.dispatchEvent(event);
  };
  
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    // Optimistically update UI first
    const deletedFileIds = new Set(selectedFiles);
    const updatedFiles = localFiles.filter(file => !deletedFileIds.has(file.id));
    setLocalFiles(updatedFiles);
    
    // Clear selection since files are being deleted
    setSelectedFiles([]);
    
    for (const fileId of selectedFiles) {
      const file = files.find(f => f.id === fileId);
      if (!file) continue;
      
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('raw_uploads')
          .remove([file.bucketPath || '']);
        
        if (storageError) throw storageError;
        
        // Delete from database
        const { error: dbError } = await supabase
          .from('media')
          .delete()
          .eq('id', fileId);
          
        if (dbError) throw dbError;
        
      } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        toast({
          title: "Error deleting file",
          description: "One or more files could not be deleted. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    // Refresh in background to ensure data consistency
    onRefresh();
    
    toast({
      title: "Files deleted",
      description: `Successfully deleted ${selectedFiles.length} files`,
    });
  };

  const handleRemoveFromFolder = async (fileIds: string[], folderId: string) => {
    if (!onRemoveFromFolder || fileIds.length === 0 || !folderId || folderId === 'all' || folderId === 'unsorted') {
      return;
    }
    
    try {
      // Optimistically update UI
      const updatedFiles = localFiles.map(file => {
        if (fileIds.includes(file.id)) {
          return {
            ...file,
            folderRefs: (file.folderRefs || []).filter(folder => folder !== folderId)
          };
        }
        return file;
      });
      
      setLocalFiles(updatedFiles);
      
      // Run the actual operation in the background
      await onRemoveFromFolder(fileIds, folderId);
      
      // Refresh in background to ensure data consistency
      onRefresh();
    } catch (error) {
      console.error("Error removing files from folder:", error);
      toast({
        title: "Error removing files",
        description: "Failed to remove files from the folder",
        variant: "destructive",
      });
      
      // Revert the optimistic update on error
      onRefresh();
      
      throw error;
    }
  };
  
  const handleFileDeleted = (fileId: string) => {
    // Optimistically remove the file from the UI
    setLocalFiles(current => current.filter(file => file.id !== fileId));
    
    // Remove from selected files if present
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(current => current.filter(id => id !== fileId));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={isCreatorView ? handleUploadClick : undefined}
        isCreatorView={isCreatorView}
      />
      
      <div className="flex h-full">
        {/* Left sidebar for folder navigation */}
        <div className="w-64 p-4 border-r">
          <FolderNav 
            folders={availableFolders}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            onDeleteFolder={isCreatorView ? onDeleteFolder : undefined}
            onInitiateNewFolder={isCreatorView ? handleInitiateNewFolder : undefined}
          />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <FilterButtons
                view={view}
                onViewChange={setView}
                onRefresh={onRefresh}
                onBulkDownload={handleBulkDownload}
                onBulkDelete={handleBulkDelete}
                selectedFilesCount={selectedFiles.length}
                canDelete={canDelete}
              />
            </div>
            
            {isLoading ? (
              <FileViewSkeleton view={view} />
            ) : filteredFiles.length > 0 ? (
              view === 'list' ? (
                <FileList 
                  files={filteredFiles} 
                  isCreatorView={isCreatorView} 
                  onFilesChanged={handleFilesChanged}
                  onFileDeleted={handleFileDeleted}
                  recentlyUploadedIds={recentlyUploadedIds}
                  onSelectFiles={handleFileSelection}
                  onAddToFolderClick={selectedFiles.length > 0 ? () => setShowAddToFolderDialog(true) : undefined}
                  currentFolder={currentFolder}
                  onRemoveFromFolder={onRemoveFromFolder ? handleRemoveFromFolder : undefined}
                />
              ) : (
                <FileGrid 
                  files={filteredFiles} 
                  isCreatorView={isCreatorView} 
                  onFilesChanged={handleFilesChanged}
                  onFileDeleted={handleFileDeleted}
                  recentlyUploadedIds={recentlyUploadedIds}
                  onUploadClick={isCreatorView ? handleUploadClick : undefined}
                  onSelectFiles={handleFileSelection}
                  onAddToFolderClick={selectedFiles.length > 0 ? () => setShowAddToFolderDialog(true) : undefined}
                  currentFolder={currentFolder}
                  onRemoveFromFolder={onRemoveFromFolder ? handleRemoveFromFolder : undefined}
                />
              )
            ) : (
              <EmptyState 
                currentFolder={currentFolder} 
                onUploadClick={isCreatorView ? handleUploadClick : undefined}
                isCreatorView={isCreatorView}
                isFiltered={searchQuery.length > 0}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Warning dialog for no files selected */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No Files Selected</DialogTitle>
            <DialogDescription>
              Please select at least 1 file to create a folder.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowWarningDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add direct file input for upload (hidden) */}
      {isCreatorView && (
        <>
          <FileUploaderWithProgress
            id="direct-file-upload"
            creatorId={creatorId}
            onUploadComplete={handleUploadComplete}
            currentFolder={currentFolder}
          />
          <FileDownloader />
        </>
      )}

      {/* Add to Folder Dialog with tabs for existing or new folder */}
      <Dialog open={showAddToFolderDialog} onOpenChange={setShowAddToFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Files to Folder</DialogTitle>
            <DialogDescription>
              Select a destination for the {selectedFiles.length} selected files.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={addFolderDialogTab} onValueChange={setAddFolderDialogTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Existing Folder</TabsTrigger>
              <TabsTrigger value="new">New Folder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="existing">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="folder">Destination Folder</Label>
                  <Select 
                    value={targetFolder} 
                    onValueChange={setTargetFolder}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddToFolderDialog(false)}>Cancel</Button>
                <Button onClick={handleAddToFolder} disabled={!targetFolder}>
                  Add Files to Folder
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="new">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-folder-name">New Folder Name</Label>
                  <Input 
                    id="new-folder-name"
                    placeholder="Enter folder name" 
                    value={newFolderInDialog}
                    onChange={(e) => setNewFolderInDialog(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddToFolderDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddToFolder} 
                  disabled={!newFolderInDialog.trim()}
                >
                  Create Folder
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Select files and enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input 
                id="folder-name"
                placeholder="Enter folder name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Selected Files ({selectedFiles.length})</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                <ul className="text-sm">
                  {selectedFiles.map(id => {
                    const file = files.find(f => f.id === id);
                    return (
                      <li key={id} className="py-1 px-2 truncate">
                        {file ? file.name : `File ${id}`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowNewFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || selectedFiles.length === 0 || isFolderCreating}
            >
              {isFolderCreating ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

