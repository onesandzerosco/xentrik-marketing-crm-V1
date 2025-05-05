import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { FileHeader } from './FileHeader';
import { FolderNav } from './FolderNav';
import { FileGrid } from './FileGrid';
import { FileList } from './FileList';
import { FilterBar } from './FilterBar';
import { FileViewSkeleton } from './FileViewSkeleton';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DragDropUploader from './DragDropUploader';
import { useToast } from "@/components/ui/use-toast";
import { useFilePermissions } from '@/utils/permissionUtils';
import { supabase } from '@/integrations/supabase/client';

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
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  availableFolders: Folder[];
  isCreatorView: boolean;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder: (folderName: string, fileIds: string[]) => Promise<void>;
  onAddFilesToFolder: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
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
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onAddFilesToFolder,
  onDeleteFolder,
  onRemoveFromFolder
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isDeleteFolderModalOpen, setIsDeleteFolderModalOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const permissions = useFilePermissions();
  
  // New state for editing file notes
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<CreatorFileType | null>(null);
  const [editingNote, setEditingNote] = useState('');
  
  // Handler for note editing
  const handleEditNote = (file: CreatorFileType) => {
    setEditingFile(file);
    setEditingNote(file.description || '');
    setIsEditNoteModalOpen(true);
  };
  
  // Save the edited note
  const handleSaveNote = async () => {
    if (!editingFile) return;
    
    try {
      // Update the file's description in the database
      const { error } = await supabase
        .from('media')
        .update({ description: editingNote })
        .eq('id', editingFile.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Note updated",
        description: "File description has been updated successfully.",
      });
      
      // Close the modal and refresh the files list
      setIsEditNoteModalOpen(false);
      setEditingFile(null);
      setEditingNote('');
      onRefresh();
      
    } catch (error) {
      console.error("Error updating note:", error);
      toast({
        title: "Error updating note",
        description: "An error occurred while updating the file description.",
        variant: "destructive"
      });
    }
  };

  // Filter files based on search and type filters
  const filteredFiles = files.filter(file => {
    const matchesSearch = searchQuery === '' || 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(file.type);
    
    return matchesSearch && matchesType;
  });
  
  // Handler for creating a new folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast({
        title: "Folder name required",
        description: "Please enter a valid folder name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onCreateFolder(newFolderName, selectedFileIds);
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      setSelectedFileIds([]);
    } catch (error) {
      toast({
        title: "Error creating folder",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  // Handler for adding files to an existing folder
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFolderId || selectedFileIds.length === 0) {
      toast({
        title: "Selection required",
        description: "Please select a folder and at least one file",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onAddFilesToFolder(selectedFileIds, targetFolderId);
      setIsAddToFolderModalOpen(false);
      setTargetFolderId('');
      toast({
        title: "Files added to folder",
        description: `${selectedFileIds.length} files added to folder successfully`,
      });
      setSelectedFileIds([]);
    } catch (error) {
      toast({
        title: "Error adding to folder",
        description: "Failed to add files to folder",
        variant: "destructive"
      });
    }
  };

  // Handler for deleting a folder
  const handleDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      await onDeleteFolder(folderToDelete);
      setFolderToDelete(null);
      setIsDeleteFolderModalOpen(false);
    } catch (error) {
      toast({
        title: "Error deleting folder",
        description: "Failed to delete folder",
        variant: "destructive"
      });
    }
  };

  // Handler for file deletion
  const handleFileDeleted = (fileId: string) => {
    // Remove the file from selectedFileIds if it's selected
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  // Custom folders (excluding 'all' and 'unsorted')
  const customFolders = availableFolders.filter(
    folder => folder.id !== 'all' && folder.id !== 'unsorted'
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-10">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={() => setIsUploadModalOpen(true)}
        isCreatorView={isCreatorView}
      />
      
      <div className="mt-4 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0 mt-1">
          <FolderNav 
            folders={availableFolders}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            onInitiateNewFolder={() => {
              if (selectedFileIds.length > 0) {
                setIsAddFolderModalOpen(true);
              } else {
                toast({
                  title: "Select files first",
                  description: "Please select at least one file to add to a new folder",
                });
              }
            }}
            onDeleteFolder={(folderId) => {
              setFolderToDelete(folderId);
              setIsDeleteFolderModalOpen(true);
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <FilterBar 
            activeFilter={selectedTypes.length > 0 ? selectedTypes[0] : null}
            onFilterChange={(filter) => {
              setSelectedTypes(filter ? [filter] : []);
            }}
            searchQuery={searchQuery}
            onSearchChange={(query) => setSearchQuery(query)}
          />
          
          {isLoading ? (
            <FileViewSkeleton view={viewMode} />
          ) : viewMode === 'grid' ? (
            <FileGrid 
              files={filteredFiles}
              isCreatorView={isCreatorView}
              onFilesChanged={onRefresh}
              onFileDeleted={handleFileDeleted}
              recentlyUploadedIds={recentlyUploadedIds}
              onSelectFiles={setSelectedFileIds}
              onAddToFolderClick={() => {
                if (selectedFileIds.length > 0 && customFolders.length > 0) {
                  setIsAddToFolderModalOpen(true);
                } else if (selectedFileIds.length === 0) {
                  toast({
                    title: "Select files first",
                    description: "Please select at least one file to add to a folder",
                  });
                } else {
                  toast({
                    title: "No custom folders",
                    description: "Please create a folder first",
                  });
                  setIsAddFolderModalOpen(true);
                }
              }}
              currentFolder={currentFolder}
              onRemoveFromFolder={onRemoveFromFolder}
              onEditNote={handleEditNote}
            />
          ) : (
            <FileList 
              files={filteredFiles}
              isCreatorView={isCreatorView}
              onFilesChanged={onRefresh}
              onFileDeleted={handleFileDeleted}
              recentlyUploadedIds={recentlyUploadedIds}
              onSelectFiles={setSelectedFileIds}
              onAddToFolderClick={() => {
                if (selectedFileIds.length > 0 && customFolders.length > 0) {
                  setIsAddToFolderModalOpen(true);
                } else if (selectedFileIds.length === 0) {
                  toast({
                    title: "Select files first",
                    description: "Please select at least one file to add to a folder",
                  });
                } else {
                  toast({
                    title: "No custom folders",
                    description: "Please create a folder first",
                  });
                  setIsAddFolderModalOpen(true);
                }
              }}
              currentFolder={currentFolder}
              onRemoveFromFolder={onRemoveFromFolder}
              onEditNote={handleEditNote}
            />
          )}
        </div>
      </div>
      
      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload files to {creatorName}'s storage
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <DragDropUploader 
              creatorId={creatorId} 
              onUploadComplete={(fileIds) => {
                onUploadComplete?.(fileIds);
                setIsUploadModalOpen(false);
              }}
              onCancel={() => setIsUploadModalOpen(false)}
              currentFolder={currentFolder}
            />
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Create Folder Modal */}
      <Dialog open={isAddFolderModalOpen} onOpenChange={setIsAddFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateFolderSubmit}>
            <div className="py-4">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input 
                id="folderName" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="My Folder"
                className="mt-2"
              />
              
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedFileIds.length > 0 ? (
                  `${selectedFileIds.length} files will be added to this folder.`
                ) : (
                  "No files selected. You can add files to this folder later."
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddFolderModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Create Folder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add to Folder Modal */}
      <Dialog open={isAddToFolderModalOpen} onOpenChange={setIsAddToFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to add the selected files to.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddToFolderSubmit}>
            <div className="py-4">
              <Label htmlFor="folderId">Select Folder</Label>
              <select 
                id="folderId" 
                value={targetFolderId} 
                onChange={(e) => setTargetFolderId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2"
              >
                <option value="">-- Select a folder --</option>
                {customFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedFileIds.length} files will be added to the selected folder.
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddToFolderModalOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={!targetFolderId}>Add to Folder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Confirmation Modal */}
      <Dialog open={isDeleteFolderModalOpen} onOpenChange={setIsDeleteFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this folder? The files will remain available in "Unsorted Uploads".
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteFolderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Note Modal */}
      <Dialog open={isEditNoteModalOpen} onOpenChange={setIsEditNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Description</DialogTitle>
            <DialogDescription>
              Update the description for {editingFile?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="fileDescription">Description</Label>
            <Textarea 
              id="fileDescription" 
              value={editingNote} 
              onChange={(e) => setEditingNote(e.target.value)}
              placeholder="Add a description for this file..."
              className="mt-2"
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Save Description
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
