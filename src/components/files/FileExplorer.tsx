
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
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder?: (folderName: string, fileIds: string[]) => Promise<void>; // Modified to accept fileIds
  onAddFilesToFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
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
  onDeleteFolder
}) => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showAddToFolderDialog, setShowAddToFolderDialog] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string>('');
  const { toast } = useToast();
  
  // New folder creation states
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isFolderCreating, setIsFolderCreating] = useState(false);
  const [addFolderDialogTab, setAddFolderDialogTab] = useState('existing');
  const [newFolderInDialog, setNewFolderInDialog] = useState('');
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    setShowUploader(true);
  };
  
  const handleUploadComplete = (uploadedFileIds?: string[]) => {
    setShowUploader(false);
    if (onUploadComplete) {
      onUploadComplete(uploadedFileIds);
    }
    onRefresh();
  };
  
  const handleFilesChanged = () => {
    onRefresh();
  };

  const handleInitiateNewFolder = () => {
    // If there are no files to select, show an error
    if (files.length === 0) {
      toast({
        title: "No files available",
        description: "You need to upload files before creating a folder.",
        variant: "destructive",
      });
      return;
    }
    
    // Clear previous selection and show the dialog
    setSelectedFiles([]);
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
      if (onCreateFolder) {
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
        if (onAddFilesToFolder) {
          await onAddFilesToFolder(selectedFiles, targetFolder);
        }
        
        setShowAddToFolderDialog(false);
        setSelectedFiles([]);
        setTargetFolder('');
        
        toast({
          title: "Files added to folder",
          description: `Successfully added ${selectedFiles.length} files to folder`,
        });
        
        onRefresh();
      } catch (error) {
        console.error("Error adding files to folder:", error);
        toast({
          title: "Error adding files to folder",
          description: "Failed to add files to the selected folder",
          variant: "destructive",
        });
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
        if (onCreateFolder) {
          await onCreateFolder(newFolderInDialog.trim(), selectedFiles);
        }
        
        setShowAddToFolderDialog(false);
        setNewFolderInDialog('');
        setSelectedFiles([]);
        
        toast({
          title: "Folder created",
          description: `Successfully created folder with ${selectedFiles.length} files`,
        });
        
        onRefresh();
      } catch (error) {
        console.error("Error creating folder:", error);
        toast({
          title: "Error creating folder",
          description: "Failed to create the new folder",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={isCreatorView ? handleUploadClick : undefined}
        isCreatorView={isCreatorView}
        selectedFiles={selectedFiles.length}
        onAddToFolderClick={() => {
          if (selectedFiles.length > 0) {
            setShowAddToFolderDialog(true);
            setAddFolderDialogTab('existing');
            setNewFolderInDialog('');
            setTargetFolder('');
          }
        }}
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
                onUploadClick={isCreatorView ? handleUploadClick : undefined}
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
                  recentlyUploadedIds={recentlyUploadedIds}
                  onSelectFiles={handleFileSelection}
                />
              ) : (
                <FileGrid 
                  files={filteredFiles} 
                  isCreatorView={isCreatorView} 
                  onFilesChanged={handleFilesChanged}
                  recentlyUploadedIds={recentlyUploadedIds}
                  onUploadClick={isCreatorView ? handleUploadClick : undefined}
                  onSelectFiles={handleFileSelection}
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
      
      {showUploader && (
        <DragDropUploader 
          creatorId={creatorId}
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowUploader(false)}
          currentFolder={currentFolder}
        />
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
              {selectedFiles.length === 0 ? (
                <div className="text-sm text-muted-foreground flex items-center justify-center p-4 border rounded-md">
                  Please select at least one file to add to this folder
                </div>
              ) : (
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
              )}
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
