
import React from 'react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DeleteFolderModal } from '../DeleteFolderModal';
import { RenameFolderModal } from '../RenameFolderModal';
import { AddToFolderModal } from '../AddToFolderModal';
import { CreateFolderModal } from '../CreateFolderModal';
import { Category } from '@/types/fileTypes';

interface FolderModalsProps {
  // Add folder modal props
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  
  // Add to folder modal props
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  
  // Delete folder modal props
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  folderToDelete?: string | null;
  setFolderToDelete?: (id: string | null) => void;
  
  // Rename folder modal props
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  folderToRename?: string | null;
  setFolderToRename?: (id: string | null) => void;
  folderCurrentName: string;
  
  // Common props
  selectedFileIds: string[];
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  
  // Handlers
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: (folderId: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => void;
  onCreateNewFolder?: () => void;
}

export const FolderModals: React.FC<FolderModalsProps> = ({
  // Add folder modal props
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  
  // Add to folder modal props
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  
  // Delete folder modal props
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  folderToDelete,
  setFolderToDelete,
  
  // Rename folder modal props
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  folderToRename,
  setFolderToRename,
  folderCurrentName,
  
  // Common props
  selectedFileIds,
  customFolders,
  categories,
  
  // Handlers
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  onCreateNewFolder
}) => {
  return (
    <>
      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        selectedCategoryId={selectedCategoryForNewFolder}
        availableCategories={categories}
        handleSubmit={handleCreateFolderSubmit}
        onCreate={onCreateNewFolder}
      />
      
      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        customFolders={customFolders}
        selectedFileIds={selectedFileIds}
        categories={categories}
        handleSubmit={handleAddToFolderSubmit}
        onCreateNewFolder={onCreateNewFolder}
      />
      
      {/* Delete Folder Modal */}
      {setFolderToDelete && (
        <DeleteFolderModal 
          isOpen={isDeleteFolderModalOpen}
          onOpenChange={setIsDeleteFolderModalOpen}
          onConfirm={() => handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete)}
        />
      )}
      
      {/* Rename Folder Modal */}
      {setFolderToRename && (
        <RenameFolderModal
          isOpen={isRenameFolderModalOpen}
          onOpenChange={setIsRenameFolderModalOpen}
          currentName={folderCurrentName}
          onRename={(newName) => handleRenameFolder(folderToRename, newName, setIsRenameFolderModalOpen, setFolderToRename)}
        />
      )}
    </>
  );
};
