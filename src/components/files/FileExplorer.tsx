import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Upload, FolderPlus, Edit, MoreVertical, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { CreatorFileType, Category, Folder } from '@/types/fileTypes';
import { supabase } from '@/integrations/supabase/client';
import { useFileFilters } from './explorer/hooks/useFileFilters';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TagSelector from './TagSelector';
import { FileTag } from '@/hooks/useFileTags';

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
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (uploadedFileIds?: string[]) => void;
  onUploadStart: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], targetFolderId: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newFolderName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newCategoryName: string) => Promise<void>;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  availableTags: FileTag[];
  onTagCreate?: (name: string) => Promise<FileTag | null>;
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
  onRenameCategory,
  selectedTags,
  setSelectedTags,
  availableTags,
  onTagCreate
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams();

  // State for managing modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddToFolderModal, setShowAddToFolderModal] = useState(false);
  
  // State for file editing
  const [fileToEdit, setFileToEdit] = useState<CreatorFileType | null>(null);
  const [editedNote, setEditedNote] = useState('');
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  
  // State for file selection
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // State for tag dialog
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [fileToTag, setFileToTag] = useState<CreatorFileType | null>(null);
  const [selectedFileTag, setSelectedFileTag] = useState<string>('');

  // File upload handlers
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      onUploadStart();
      
      const uploadedFileIds: string[] = [];
      
      for (const file of acceptedFiles) {
        try {
          // Generate a unique file name
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${creatorId}/${fileName}`;
          
          // Upload the file to Supabase storage
          const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (error) {
            console.error('Error uploading file:', error);
            toast({
              title: 'Upload Failed',
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: 'destructive',
            });
            continue;
          }
          
          // Get the public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(data.path);
          
          // Create a new media record in the database
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              file_size: file.size,
              filename: file.name,
              mime: file.type,
              bucket_key: data.path,
              folders: currentFolder !== 'all' ? [currentFolder] : [],
              categories: currentCategory ? [currentCategory] : [],
              status: 'available',
              tags: []  // Initialize with empty tags array
            })
            .select()
            .single();
          
          if (mediaError) {
            console.error('Error creating media record:', mediaError);
            toast({
              title: 'Upload Failed',
              description: `Failed to create record for ${file.name}. Please try again.`,
              variant: 'destructive',
            });
            continue;
          }
          
          uploadedFileIds.push(mediaData.id);
          
          toast({
            title: 'Upload Complete',
            description: `${file.name} uploaded successfully.`,
          });
        } catch (err: any) {
          console.error('Unexpected error during upload:', err);
          toast({
            title: 'Upload Error',
            description: `An unexpected error occurred during the upload of ${file.name}.`,
            variant: 'destructive',
          });
        }
      }
      
      onUploadComplete(uploadedFileIds);
      setShowUploadModal(false);
    },
    [creatorId, currentFolder, currentCategory, onUploadComplete, onUploadStart, toast]
  );
  
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    disabled: !isCreatorView,
  });
  
  // File description handlers
  const handleEditNote = (file: CreatorFileType) => {
    setFileToEdit(file);
    setEditedNote(file.description || '');
    setShowEditNoteModal(true);
  };
  
  const handleUpdateNote = async () => {
    if (!fileToEdit) return;
    
    try {
      const { error } = await supabase
        .from('media')
        .update({ description: editedNote })
        .eq('id', fileToEdit.id);
      
      if (error) {
        throw error;
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.map((file: CreatorFileType) =>
          file.id === fileToEdit.id ? { ...file, description: editedNote } : file
        );
        
        return updatedFiles;
      });
      
      setFileToEdit(null);
      setShowEditNoteModal(false);
      toast({
        title: 'Note Updated',
        description: 'File note updated successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error updating note:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  // File deletion handler
  const handleFileDeleted = async (fileId: string): Promise<void> => {
    try {
      // Get the file from the database
      const { data: file, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', fileId)
        .single();
      
      if (fetchError) {
        throw new Error(`Failed to fetch file: ${fetchError.message}`);
      }
      
      // Delete the file from Supabase storage
      if (file?.bucket_key) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([file.bucket_key]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          toast({
            title: 'Error Deleting File',
            description: 'Failed to delete file from storage. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Delete the file record from the database
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) {
        throw new Error(`Failed to delete file from database: ${deleteError.message}`);
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.filter((file: CreatorFileType) => file.id !== fileId);
        return updatedFiles;
      });
      
      toast({
        title: 'File Deleted',
        description: 'File deleted successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error Deleting File',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateFolderClick = () => {
    setShowUploadModal(true);
  };
  
  const handleAddToFolderClick = () => {
    setShowAddToFolderModal(true);
  };
  
  // File filtering and view
  const {
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles
  } = useFileFilters({ 
    files,
    selectedTags
  });

  // Add handler function for adding tags
  const handleAddTag = (file: CreatorFileType) => {
    setFileToTag(file);
    setSelectedFileTag('');
    setShowTagDialog(true);
  };

  // Add handler function for saving tags
  const handleSaveTag = async () => {
    if (!fileToTag || !selectedFileTag) return;
    
    try {
      // Get current tags or empty array
      const currentTags = fileToTag.tags || [];
      
      // Check if tag already exists
      if (currentTags.includes(selectedFileTag)) {
        toast({
          title: 'Tag already exists',
          description: 'This file already has this tag.',
        });
        return;
      }
      
      // Add the new tag
      const updatedTags = [...currentTags, selectedFileTag];
      
      // Update the file in Supabase
      const { error } = await supabase
        .from('media')
        .update({ tags: updatedTags })
        .eq('id', fileToTag.id);
      
      if (error) throw error;
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.map((file: CreatorFileType) =>
          file.id === fileToTag.id ? { ...file, tags: updatedTags } : file
        );
        
        return updatedFiles;
      });
      
      // Close dialog and refresh
      setFileToTag(null);
      setShowTagDialog(false);
      toast({
        title: 'Tag Added',
        description: 'File tag added successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Add handler for tag selection
  const handleTagSelect = (tagId: string) => {
    setSelectedFileTag(tagId);
  };
  
  const contextValue = {
    selectedFileIds,
    setSelectedFileIds,
    currentFolder,
    currentCategory,
    handleAddToFolderClick,
    creatorName,
    creatorId,
    isCreatorView,
    availableFolders,
    availableCategories,
    onCategoryChange,
    viewMode,
    isLoading,
    handleInitiateNewCategory: () => {},
    handleInitiateNewFolder: () => {},
    handleDeleteCategoryClick: () => {},
    handleRenameCategoryClick: () => {},
    handleDeleteFolderClick: () => {},
    handleRenameFolderClick: () => {},
    onDeleteFolder: onDeleteFolder || (async () => {}),
    onDeleteCategory: onDeleteCategory || (async () => {}),
    onRemoveFromFolder
  };

  return (
    <div className="flex flex-col h-full w-full">
      <FileExplorerProvider value={contextValue}>
        <FileExplorerLayout
          filteredFiles={filteredFiles}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={open}
          onRefresh={onRefresh}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTypes={selectedTypes.length > 0 ? selectedTypes[0] : null}
          setSelectedTypes={(type) => setSelectedTypes(type ? [type] : [])}
          onFolderChange={onFolderChange}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
          onTagCreate={onTagCreate}
          onEditNote={handleEditNote}
          onCreateFolder={handleCreateFolderClick}
          onAddTag={handleAddTag}
        />
      
      {showTagDialog && fileToTag && (
        <Dialog open={showTagDialog} onOpenChange={(open) => !open && setShowTagDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tag to File</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Select a tag to add to "{fileToTag.filename || fileToTag.name}"
              </p>
              <TagSelector
                tags={availableTags || []}
                selectedTags={[selectedFileTag]}
                onTagSelect={handleTagSelect}
                onTagCreate={onTagCreate}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowTagDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTag}
                disabled={!selectedFileTag}
              >
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showEditNoteModal && fileToEdit && (
        <Dialog open={showEditNoteModal} onOpenChange={(open) => !open && setShowEditNoteModal(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Add or edit a note for "{fileToEdit.filename || fileToEdit.name}"
              </p>
              <textarea
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="w-full h-32 border rounded-md p-2"
                placeholder="Enter a note for this file..."
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditNoteModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateNote}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showUploadModal && (
        <Dialog open={showUploadModal} onOpenChange={(open) => !open && setShowUploadModal(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div {...getRootProps()} className="border-2 border-dashed rounded-md p-8 text-center cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop the files here ...</p>
                ) : (
                  <div>
                    <p className="mb-2">Drag 'n' drop some files here, or click to select files</p>
                    <Button onClick={open}>Select Files</Button>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
