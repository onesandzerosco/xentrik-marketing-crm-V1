import React from 'react';
import { FileUploadModal } from './FileUploadModal';
import { AddToFolderModal } from './AddToFolderModal';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateCategoryModal } from './CreateCategoryModal';
import { DeleteFolderModal } from './DeleteFolderModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { EditNoteModal } from './EditNoteModal';
import { AddTagModal } from './modals/TagModals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FileExplorerModalsProps {
  onRefresh: () => void;
  onUploadComplete?: (fileIds?: string[]) => void;
  onUploadStart?: () => void;
  creatorId: string;
  currentFolder: string;
  currentCategory: string | null;
  availableFolders: Array<{ id: string; name: string; categoryId: string }>;
  availableCategories: Array<{ id: string; name: string }>;
  onCreateCategory?: (name: string) => Promise<void>;
  onCreateFolder?: (name: string, fileIds: string[], categoryId: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], folderId: string, categoryId: string) => Promise<void>;
  fileExplorerState: {
    isUploadModalOpen: boolean;
    setIsUploadModalOpen: (isOpen: boolean) => void;
    isAddToFolderModalOpen: boolean;
    setIsAddToFolderModalOpen: (isOpen: boolean) => void;
    isCreateFolderModalOpen: boolean;
    setIsCreateFolderModalOpen: (isOpen: boolean) => void;
    isAddCategoryModalOpen: boolean;
    setIsAddCategoryModalOpen: (isOpen: boolean) => void;
    isDeleteFolderModalOpen: boolean;
    setIsDeleteFolderModalOpen: (isOpen: boolean) => void;
    isDeleteCategoryModalOpen: boolean;
    setIsDeleteCategoryModalOpen: (isOpen: boolean) => void;
    isFileNoteModalOpen: boolean;
    setIsFileNoteModalOpen: (isOpen: boolean) => void;
    fileToEdit: any;
    setFileToEdit: (file: any) => void;
    selectedFileIds: string[];
    // Tag related props
    isAddTagModalOpen?: boolean;
    setIsAddTagModalOpen?: (isOpen: boolean) => void;
    availableTags?: any[];
    onAddTagToFiles?: (tagName: string) => Promise<void>;
    onRemoveTagFromFiles?: (tagName: string) => Promise<void>;
    onTagCreate?: (name: string) => Promise<any>;
  };
}

export const FileExplorerModals: React.FC<FileExplorerModalsProps> = ({
  onRefresh,
  onUploadComplete,
  onUploadStart,
  creatorId,
  currentFolder,
  currentCategory,
  availableFolders,
  availableCategories,
  onCreateCategory,
  onCreateFolder,
  onAddFilesToFolder,
  fileExplorerState
}) => {
  const [targetFolderId, setTargetFolderId] = React.useState('');
  const [targetCategoryId, setTargetCategoryId] = React.useState('');
  const [editingNote, setEditingNote] = React.useState('');
  const { toast } = useToast();

  // Initialize editing note when file changes
  React.useEffect(() => {
    if (fileExplorerState.fileToEdit) {
      setEditingNote(fileExplorerState.fileToEdit.description || '');
    }
  }, [fileExplorerState.fileToEdit]);

  const handleAddToFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFolderId || !targetCategoryId || fileExplorerState.selectedFileIds.length === 0 || !onAddFilesToFolder) return;
    
    try {
      await onAddFilesToFolder(fileExplorerState.selectedFileIds, targetFolderId, targetCategoryId);
      fileExplorerState.setIsAddToFolderModalOpen(false);
      setTargetFolderId('');
      onRefresh();
    } catch (error) {
      console.error('Error adding files to folder:', error);
    }
  };

  const handleCreateNewFolder = () => {
    fileExplorerState.setIsAddToFolderModalOpen(false);
    fileExplorerState.setIsCreateFolderModalOpen(true);
  };

  const handleCreateNewCategory = () => {
    fileExplorerState.setIsAddToFolderModalOpen(false);
    fileExplorerState.setIsAddCategoryModalOpen(true);
  };

  // Inline creation handlers for the AddToFolderModal
  const handleInlineCreateCategory = async (name: string) => {
    if (onCreateCategory) {
      await onCreateCategory(name);
      onRefresh();
    }
  };

  const handleInlineCreateFolder = async (name: string, categoryId: string) => {
    if (onCreateFolder && onAddFilesToFolder) {
      // First create the folder with the selected files
      await onCreateFolder(name, fileExplorerState.selectedFileIds, categoryId);
      onRefresh();
      
      // Find the newly created folder and set it as the target
      // We'll need to wait a moment for the folder to be created and available
      setTimeout(() => {
        const newFolder = availableFolders.find(folder => 
          folder.name === name && folder.categoryId === categoryId
        );
        if (newFolder) {
          setTargetFolderId(newFolder.id);
        }
      }, 100);
    }
  };

  const handleSaveNote = async () => {
    if (!fileExplorerState.fileToEdit) return;
    
    try {
      // Update the file's description in the database
      const { error } = await supabase
        .from('media')
        .update({ description: editingNote })
        .eq('id', fileExplorerState.fileToEdit.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Note updated",
        description: "File description has been updated successfully.",
      });
      
      // Close the modal and refresh the files list
      fileExplorerState.setIsFileNoteModalOpen(false);
      fileExplorerState.setFileToEdit(null);
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

  return (
    <>
      <FileUploadModal
        isOpen={fileExplorerState.isUploadModalOpen}
        onOpenChange={fileExplorerState.setIsUploadModalOpen}
        creatorId={creatorId}
        creatorName=""
        currentFolder={currentFolder}
        availableCategories={availableCategories} 
        onUploadComplete={onUploadComplete}
        onFilesChanged={onUploadStart ? () => onUploadStart() : undefined}
      />
      
      <AddToFolderModal
        isOpen={fileExplorerState.isAddToFolderModalOpen}
        onOpenChange={fileExplorerState.setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        numSelectedFiles={fileExplorerState.selectedFileIds.length}
        customFolders={availableFolders}
        categories={availableCategories}
        handleSubmit={handleAddToFolderSubmit}
        onCreateNewFolder={handleCreateNewFolder}
        onCreateNewCategory={handleCreateNewCategory}
        onCreateCategory={handleInlineCreateCategory}
        onCreateFolder={handleInlineCreateFolder}
      />
      
      <CreateFolderModal
        isOpen={fileExplorerState.isCreateFolderModalOpen}
        onOpenChange={fileExplorerState.setIsCreateFolderModalOpen}
        newFolderName=""
        setNewFolderName={() => {}}
        selectedCategoryId={currentCategory || ""}
        availableCategories={availableCategories}
        handleSubmit={(e) => { e.preventDefault(); onRefresh(); }}
      />
      
      <CreateCategoryModal
        isOpen={fileExplorerState.isAddCategoryModalOpen}
        onOpenChange={fileExplorerState.setIsAddCategoryModalOpen}
        newCategoryName=""
        setNewCategoryName={() => {}}
        handleSubmit={(e) => { e.preventDefault(); onRefresh(); }}
        onCreate={() => onRefresh()}
      />
      
      <DeleteFolderModal
        isOpen={fileExplorerState.isDeleteFolderModalOpen}
        onOpenChange={fileExplorerState.setIsDeleteFolderModalOpen}
        onConfirm={() => onRefresh()}
      />
      
      <DeleteCategoryModal
        isOpen={fileExplorerState.isDeleteCategoryModalOpen}
        onOpenChange={fileExplorerState.setIsDeleteCategoryModalOpen}
        onConfirm={() => onRefresh()}
      />
      
      <EditNoteModal
        isOpen={fileExplorerState.isFileNoteModalOpen}
        onOpenChange={fileExplorerState.setIsFileNoteModalOpen}
        file={fileExplorerState.fileToEdit}
        note={editingNote}
        setNote={setEditingNote}
        onSave={handleSaveNote}
      />
      
      {/* Add Tag Modal */}
      {fileExplorerState.isAddTagModalOpen !== undefined && fileExplorerState.setIsAddTagModalOpen && (
        <AddTagModal
          isOpen={fileExplorerState.isAddTagModalOpen}
          onOpenChange={fileExplorerState.setIsAddTagModalOpen}
          selectedFileIds={fileExplorerState.selectedFileIds}
          availableTags={fileExplorerState.availableTags || []}
          onTagSelect={fileExplorerState.onAddTagToFiles || (() => Promise.resolve())}
          onTagRemove={fileExplorerState.onRemoveTagFromFiles}
          onTagCreate={fileExplorerState.onTagCreate}
          singleFileName={fileExplorerState.fileToEdit?.name}
          fileTags={fileExplorerState.fileToEdit?.tags || []}
        />
      )}
    </>
  );
};
