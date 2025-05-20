
import React, { useEffect, useState } from 'react';
import { FileExplorerLayout } from './explorer/layout/FileExplorerLayout';
import { useFileExplorer } from './explorer/useFileExplorer';
import { FileExplorerModals } from './explorer/FileExplorerModals';
import { FileExplorerContent } from './explorer/FileExplorerContent';
import { FileExplorerHeader } from './explorer/FileExplorerHeader';
import { Category, CreatorFileType, Folder } from '@/types/fileTypes';
import { FileExplorerSidebar } from './explorer/FileExplorerSidebar';
import { FileExplorerProvider } from './explorer/context/FileExplorerContext';
import { useFileTags } from '@/hooks/useFileTags';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  currentFolder: string;
  onFolderChange: (folderId: string) => void;
  currentCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  availableFolders: Folder[];
  availableCategories: Category[];
  isCreatorView: boolean;
  onUploadComplete: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds: string[];
  onCreateFolder?: (folderName: string, fileIds: string[], categoryId: string) => Promise<void>;
  onCreateCategory?: (categoryName: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId?: string) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onDeleteCategory?: (categoryId: string) => Promise<void>;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
  onRenameFolder?: (folderId: string, newName: string) => Promise<void>;
  onRenameCategory?: (categoryId: string, newName: string) => Promise<void>;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  currentFolder,
  onFolderChange,
  currentCategory,
  onCategoryChange,
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
  // Pass the creatorId to useFileTags
  const { 
    availableTags, 
    selectedTags,
    setSelectedTags,
    addTagToFiles,
    removeTagFromFiles,
    createTag,
    deleteTag,
    filterFilesByTags
  } = useFileTags({ creatorId });
  
  const { toast } = useToast();
  
  // State for single file tagging
  const [singleFileForTagging, setSingleFileForTagging] = useState<CreatorFileType | null>(null);
  // State for tag modal
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  
  const {
    selectedFileIds,
    setSelectedFileIds,
    handleFileDeleted,
    isAddToFolderModalOpen,
    setIsAddToFolderModalOpen,
    targetFolderId,
    setTargetFolderId,
    targetCategoryId,
    setTargetCategoryId,
    isAddFolderModalOpen,
    setIsAddFolderModalOpen,
    newFolderName,
    setNewFolderName,
    selectedCategoryForNewFolder,
    setSelectedCategoryForNewFolder,
    handleAddToFolderClick,
    handleAddToFolderSubmit,
    handleCreateNewFolder,
    handleCreateFolderSubmit,
    isEditNoteModalOpen,
    setIsEditNoteModalOpen,
    editingFile,
    editingNote,
    setEditingNote,
    handleEditNote,
    handleSaveNote,
    searchQuery,
    setSearchQuery,
    selectedTypes,
    setSelectedTypes,
    viewMode,
    setViewMode,
    filteredFiles: baseFilteredFiles,
    isUploadModalOpen,
    setIsUploadModalOpen
  } = useFileExplorer({
    files,
    availableFolders,
    availableCategories,
    currentFolder,
    currentCategory,
    onRefresh,
    onCategoryChange,
    onCreateFolder: onCreateFolder || (async () => {}),
    onCreateCategory: onCreateCategory || (async () => {}),
    onAddFilesToFolder: onAddFilesToFolder || (async () => {}),
    onDeleteFolder: onDeleteFolder || (async () => {}),
    onDeleteCategory: onDeleteCategory || (async () => {}),
    onRemoveFromFolder,
    onRenameFolder,
    onRenameCategory
  });

  // Add logging for debugging
  console.log('Available files before filtering:', files.length);
  console.log('Base filtered files (after type/search filtering):', baseFilteredFiles.length);
  console.log('Selected tags for filtering:', selectedTags);
  
  // Some files may have undefined or null tags, add logging
  const filesWithoutTags = baseFilteredFiles.filter(file => !file.tags || file.tags.length === 0).length;
  console.log('Files without tags:', filesWithoutTags);
  
  // Apply tag filtering to the already filtered files
  const filteredFiles = filterFilesByTags(baseFilteredFiles, selectedTags);
  console.log('Final filtered files (after tag filtering):', filteredFiles.length);
  
  // Handle tag selection
  const handleTagSelect = async (tagId: string) => {
    if (isAddTagModalOpen) {
      // If the tag modal is open, we're adding tags to selected files
      const fileIds = singleFileForTagging
        ? [singleFileForTagging.id]
        : selectedFileIds;
        
      try {
        await addTagToFiles(fileIds, tagId);
        toast({
          title: "Tag added",
          description: `Tag added to ${fileIds.length} ${fileIds.length === 1 ? 'file' : 'files'}.`
        });
        // Don't close the modal, allow adding multiple tags
      } catch (error) {
        console.error('Error adding tag:', error);
        toast({
          title: "Error",
          description: "Failed to add tag to files.",
          variant: "destructive"
        });
      }
    } else {
      // If we're in the filter bar, we're toggling tag filters
      console.log('Toggling tag filter:', tagId);
      setSelectedTags(prevTags => {
        if (prevTags.includes(tagId)) {
          return prevTags.filter(id => id !== tagId);
        } else {
          return [...prevTags, tagId];
        }
      });
    }
  };
  
  // Handle creating a new tag
  const handleCreateTag = async (tagName: string) => {
    try {
      const newTag = await createTag(tagName);
      return newTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  };
  
  // Open the tag modal for a specific file
  const handleAddTagToFile = (file: CreatorFileType) => {
    setSingleFileForTagging(file);
    setIsAddTagModalOpen(true);
  };
  
  // Close the add tag modal and reset the single file
  useEffect(() => {
    if (!isAddTagModalOpen) {
      setSingleFileForTagging(null);
    }
  }, [isAddTagModalOpen]);
  
  // Open the add tag modal for multiple files
  const handleAddTagClick = () => {
    setSingleFileForTagging(null);
    setIsAddTagModalOpen(true);
  };
  
  return (
    <FileExplorerProvider
      value={{
        filteredFiles,
        selectedFileIds,
        setSelectedFileIds,
        onFileDeleted: handleFileDeleted,
        isLoading,
        viewMode,
        setViewMode,
        isCreatorView,
        currentFolder,
        onFolderChange,
        searchQuery,
        setSearchQuery,
        selectedTypes,
        setSelectedTypes,
        isUploadModalOpen,
        setIsUploadModalOpen,
        onUploadComplete,
        onUploadStart,
        creatorId,
        creatorName,
        onRefresh,
        selectedTags,
        setSelectedTags,
        availableTags,
        onTagSelect: handleTagSelect,
        onTagCreate: handleCreateTag,
        onAddTagClick: handleAddTagClick,
        onAddTagToFile: handleAddTagToFile,
        currentCategory,
        onCategoryChange,
        onCreateCategory,
        onRenameFolder,
        onRenameCategory
      }}
    >
      <div className="flex flex-col h-full">
        <FileExplorerHeader 
          creatorName={creatorName}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onUploadClick={() => setIsUploadModalOpen(true)}
          isCreatorView={isCreatorView}
          onRefresh={onRefresh}
          selectedFileIds={selectedFileIds}
          onAddToFolderClick={handleAddToFolderClick}
        />
        
        <div className="flex gap-4 mt-4 flex-1 overflow-hidden">
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
            onRenameFolder={onRenameFolder}
            onRenameCategory={onRenameCategory}
            isCreatorView={isCreatorView}
          />
          
          <FileExplorerContent 
            isLoading={isLoading}
            filteredFiles={filteredFiles}
            viewMode={viewMode}
            isCreatorView={isCreatorView}
            onFilesChanged={onRefresh}
            onFileDeleted={handleFileDeleted}
            recentlyUploadedIds={recentlyUploadedIds}
            selectedFileIds={selectedFileIds}
            setSelectedFileIds={setSelectedFileIds}
            onAddToFolderClick={handleAddToFolderClick}
            onAddTagClick={handleAddTagClick}
            onAddTagToFile={handleAddTagToFile}
            currentFolder={currentFolder}
            currentCategory={currentCategory}
            onCreateFolder={handleCreateNewFolder}
            onUploadClick={() => setIsUploadModalOpen(true)}
            availableFolders={availableFolders}
            onRemoveFromFolder={onRemoveFromFolder}
            onEditNote={handleEditNote}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            availableTags={availableTags}
            onTagCreate={handleCreateTag}
          />
        </div>
      </div>
      
      <FileExplorerModals 
        selectedFileIds={selectedFileIds}
        customFolders={availableFolders}
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
        onTagSelect={handleTagSelect}
        onTagCreate={handleCreateTag}
        isAddFolderModalOpen={isAddFolderModalOpen}
        setIsAddFolderModalOpen={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryForNewFolder={selectedCategoryForNewFolder}
        setSelectedCategoryForNewFolder={setSelectedCategoryForNewFolder}
        handleCreateFolderSubmit={handleCreateFolderSubmit}
        handleAddToFolderSubmit={handleAddToFolderSubmit}
        onAddFilesToFolder={onAddFilesToFolder}
        handleCreateNewFolder={handleCreateNewFolder}
        singleFileForTagging={singleFileForTagging}
      />
      
      {/* Note editing modal */}
      {editingFile && (
        <Dialog open={isEditNoteModalOpen} onOpenChange={setIsEditNoteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Note</DialogTitle>
              <DialogDescription>
                Add or edit the note for {editingFile.name}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="note">Note</Label>
              <Input 
                id="note"
                value={editingNote || ''}
                onChange={(e) => setEditingNote(e.target.value)}
                placeholder="Add a note about this file..."
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveNote}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </FileExplorerProvider>
  );
};

