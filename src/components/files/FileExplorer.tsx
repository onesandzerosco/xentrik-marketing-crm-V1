import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Upload, FolderPlus, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { useFileFilters } from './explorer/hooks/useFileFilters';
import { supabase } from '@/integrations/supabase/client';
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { useFileTags, FileTag } from '@/hooks/useFileTags';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: { id: string; name: string; categoryId: string }[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onUploadStart: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds,
  onCreateFolder,
  onCreateCategory,
  onAddFilesToFolder,
  onDeleteFolder,
  onDeleteCategory,
  onRemoveFromFolder,
  onRenameFolder,
  onRenameCategory
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<CreatorFileType | null>(null);
  const [editedNote, setEditedNote] = useState('');
  
  const { 
    availableTags, 
    selectedTags, 
    setSelectedTags, 
    createTag, 
    filterFilesByTags,
    addTagToFiles 
  } = useFileTags();
  
  const {
    getRootProps,
    getInputProps,
    open,
    isDragActive
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    multiple: true,
    onDrop: async (acceptedFiles) => {
      if (!creatorId) {
        toast({
          title: 'Creator not found',
          description: 'Please select a creator before uploading files.',
          variant: 'destructive',
        });
        return;
      }
      
      onUploadStart();
      setIsUploading(true);
      
      // Upload files to Supabase
      const uploadedFileIds: string[] = [];
      
      for (const file of acceptedFiles) {
        // Generate a unique file ID
        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        
        // Get file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
        
        // Set the storage path
        const filePath = `${creatorId}/all/${fileId}.${fileExt}`;
        
        try {
          // Upload the file to Supabase storage
          const { error } = await supabase.storage
            .from('creator_files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (error) {
            console.error('Error uploading file:', error);
            toast({
              title: 'Upload error',
              description: `Failed to upload ${file.name}: ${error.message}`,
              variant: 'destructive',
            });
          } else {
            // File uploaded successfully
            uploadedFileIds.push(fileId);
            
            // Log the file upload in the media table
            const { error: mediaError } = await supabase
              .from('media')
              .insert({
                id: fileId,
                creator_id: creatorId,
                filename: file.name,
                file_size: file.size,
                mime: file.type,
                bucket_key: filePath,
                status: 'complete',
                folders: ['all'] // Add to the 'all' folder by default
              });
            
            if (mediaError) {
              console.error('Error logging file upload:', mediaError);
              toast({
                title: 'Upload error',
                description: `Failed to log ${file.name} in media table: ${mediaError.message}`,
                variant: 'destructive',
              });
            } else {
              console.log(`${file.name} uploaded and logged successfully`);
            }
          }
        } catch (err: any) {
          console.error('Error during upload:', err);
          toast({
            title: 'Upload error',
            description: `Failed to upload ${file.name}: ${err.message}`,
            variant: 'destructive',
          });
        }
      }
      
      setIsUploading(false);
      onUploadComplete(uploadedFileIds);
      
      if (uploadedFileIds.length > 0) {
        toast({
          title: 'Files uploaded',
          description: `Successfully uploaded ${acceptedFiles.length} files.`,
        });
      }
    },
  });
  
  // Modal states - consolidated to avoid duplicates
  const [isAddToFolderModalOpen, setIsAddToFolderModalOpen] = useState(false);
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedCategoryForNewFolder, setSelectedCategoryForNewFolder] = useState<string>('');
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  
  // Handler functions - consolidated
  const handleCreateFolderClick = () => {
    if (currentCategory) {
      setSelectedCategoryForNewFolder(currentCategory);
    }
    setIsAddFolderModalOpen(true);
  };
  
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Error',
        description: 'Folder name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!onCreateFolder) {
      toast({
        title: 'Error',
        description: 'Folder creation is not enabled for this view.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await onCreateFolder(newFolderName, [], currentCategory || 'all');
      toast({
        title: 'Folder created',
        description: `Folder "${newFolderName}" created successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create folder: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setShowCreateFolderModal(false);
      setNewFolderName('');
    }
  };
  
  const handleDeleteFile = async (fileId: string) => {
    try {
      // Delete from media table
      const { error: mediaError } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);
      
      if (mediaError) {
        console.error('Error deleting file from media table:', mediaError);
        toast({
          title: 'Error',
          description: `Failed to delete file: ${mediaError.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        return old?.filter((file: any) => file.id !== fileId) || [];
      });
      
      toast({
        title: 'File deleted',
        description: 'File deleted successfully.',
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: `Failed to delete file: ${error.message}`,
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveFromFolder = async (fileIds: string[], folderId: string) => {
    if (!onRemoveFromFolder) {
      toast({
        title: 'Error',
        description: 'Removing from folder is not enabled for this view.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await onRemoveFromFolder(fileIds, folderId);
      toast({
        title: 'Files removed',
        description: `Files removed from folder successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to remove files from folder: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles
  } = useFileFilters({ files });
  
  const finalFilteredFiles = filterFilesByTags(filteredFiles, selectedTags);
  
  const handleEditNoteClick = (file: CreatorFileType) => {
    setFileToEdit(file);
    setEditedNote(file.description || '');
    setShowEditNoteModal(true);
  };
  
  const handleSaveNote = async () => {
    if (!fileToEdit) return;
    
    try {
      // Update the file description in the media table
      const { error: mediaError } = await supabase
        .from('media')
        .update({ description: editedNote })
        .eq('id', fileToEdit.id);
      
      if (mediaError) {
        console.error('Error updating file description:', mediaError);
        toast({
          title: 'Error',
          description: `Failed to update file description: ${mediaError.message}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        return (old as CreatorFileType[])?.map((file: CreatorFileType) => {
          if (file.id === fileToEdit.id) {
            return { ...file, description: editedNote };
          }
          return file;
        }) || [];
      });
      
      toast({
        title: 'Note saved',
        description: 'File note saved successfully.',
      });
      
      setShowEditNoteModal(false);
      onRefresh();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: `Failed to save note: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleAddToFolderClick = () => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to add to a folder",
        variant: "destructive"
      });
      return;
    }
    
    setIsAddToFolderModalOpen(true);
  };
  
  const handleCreateNewFolderFromModal = () => {
    if (targetCategoryId) {
      setSelectedCategoryForNewFolder(targetCategoryId);
    }
    
    setIsAddFolderModalOpen(true);
  };
  
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
    
    if (!selectedCategoryForNewFolder) {
      toast({
        title: "Category required",
        description: "Please select a category for the new folder",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (onCreateFolder) {
        await onCreateFolder(newFolderName, selectedFileIds, selectedCategoryForNewFolder);
      }
      
      setIsAddFolderModalOpen(false);
      setNewFolderName('');
      setSelectedFileIds([]);
      
      toast({
        title: "Folder created",
        description: `Successfully created folder: ${newFolderName}`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating folder",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetFolderId || !targetCategoryId) {
      toast({
        title: "Selection required",
        description: "Please select both a category and a folder",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedFileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to add to the folder",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (onAddFilesToFolder) {
        await onAddFilesToFolder(selectedFileIds, targetFolderId, targetCategoryId);
      }
      
      setIsAddToFolderModalOpen(false);
      setTargetFolderId('');
      setTargetCategoryId('');
      setSelectedFileIds([]);
      
      toast({
        title: "Files added to folder",
        description: `${selectedFileIds.length} files added to folder successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding files to folder",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleAddTagClick = () => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to add tags",
        variant: "destructive"
      });
      return;
    }
    setSingleFileForTagging(null);
    setIsAddTagModalOpen(true);
  };
  
  const handleAddTagToFile = (file: CreatorFileType) => {
    // Set the selected file for tagging and open modal
    setSingleFileForTagging(file);
    // Clear any previously selected files
    setSelectedFileIds([]);
    setIsAddTagModalOpen(true);
  };
  
  const handleAddTagToFiles = async (tagId: string) => {
    try {
      let targetFileIds: string[] = [];
      
      // If we have a single file for tagging, use that
      if (singleFileForTagging) {
        targetFileIds = [singleFileForTagging.id];
      } else {
        // Otherwise use the selected files
        targetFileIds = selectedFileIds;
      }
      
      if (targetFileIds.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select at least one file to add tags",
          variant: "destructive"
        });
        return;
      }
      
      // Add tags to selected files
      await addTagToFiles(targetFileIds, tagId);
      
      toast({
        title: "Tag added",
        description: `Tag added to ${targetFileIds.length} ${targetFileIds.length === 1 ? 'file' : 'files'} successfully`,
      });
      
      // Clear selected file for tagging
      setSingleFileForTagging(null);
      setIsAddTagModalOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error adding tag",
        description: error.message || "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{creatorName}'s Files</h1>
        <div className="flex items-center space-x-4">
          {isCreatorView && (
            <Button onClick={open} disabled={isUploading} {...getRootProps()} >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
              <input {...getInputProps()} />
            </Button>
          )}
          
          {isCreatorView && (
            <Button variant="outline" onClick={handleCreateFolderClick}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Folder
            </Button>
          )}
          
          <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <FileExplorerSidebar
          onFolderChange={onFolderChange}
          currentFolder={currentFolder}
          onCategoryChange={onCategoryChange}
          currentCategory={currentCategory}
          availableFolders={availableFolders}
          availableCategories={availableCategories}
          onCreateCategory={onCreateCategory}
          onDeleteFolder={onDeleteFolder}
          onDeleteCategory={onDeleteCategory}
          isCreatorView={isCreatorView}
        />
        
        <FileExplorerContent
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={(query: string) => setSearchQuery(query)}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          onTagCreate={createTag}
          filteredFiles={finalFilteredFiles}
          isCreatorView={isCreatorView}
          onFilesChanged={onRefresh}
          onFileDeleted={handleDeleteFile}
          recentlyUploadedIds={recentlyUploadedIds}
          selectedFileIds={selectedFileIds}
          setSelectedFileIds={setSelectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
          onAddTagClick={handleAddTagClick}
          onAddTagToFile={handleAddTagToFile}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          onCreateFolder={currentCategory ? handleCreateFolderClick : undefined}
          availableFolders={availableFolders}
          onRemoveFromFolder={handleRemoveFromFolder}
          onEditNote={handleEditNoteClick}
        />
      </div>
      
      <FileExplorerModals
        selectedFileIds={selectedFileIds}
        customFolders={availableFolders.filter(folder => folder.id !== 'all' && folder.id !== 'unsorted')}
        categories={availableCategories}
        availableTags={availableTags}
        isAddToFolderModalOpen={isAddToFolderModalOpen}
        setIsAddToFolderModalOpen={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        isAddTagModalOpen={isAddTagModalOpen}
        setIsAddTagModalOpen={setIsAddTagModalOpen}
        onTagSelect={handleAddTagToFiles}
        onTagCreate={createTag}
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
        setSelectedCategoryForNewFolder={setSelectedCategoryForNewFolder}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        onAddFilesToFolder={onAddFilesToFolder}
        handleCreateNewFolder={handleCreateNewFolderFromModal}
        singleFileForTagging={singleFileForTagging}
      />
      
      <Dialog open={showEditNoteModal} onOpenChange={setShowEditNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              Edit the note for this file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              value={editedNote}
              onChange={(e) => setEditedNote(e.target.value)}
              placeholder="Enter note"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditNoteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
