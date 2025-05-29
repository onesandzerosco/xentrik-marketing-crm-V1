import React, { useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/fileTypes';

// Create Folder Modal Interface and Component
interface CreateFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  setFolderName: (name: string) => void;
  categories: Category[];
  selectedCategoryId: string;
  setSelectedCategoryId: (categoryId: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onOpenChange,
  folderName,
  setFolderName,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name and select a category for your new folder.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folderName" className="text-right">
                Name
              </Label>
              <Input
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3"
                placeholder="Enter folder name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!folderName.trim()}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Updated Add to Folder Modal Interface and Component
interface AddToFolderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFileIds: string[];
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  targetFolderId: string;
  setTargetFolderId: (folderId: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (categoryId: string) => void;
  onCreateFolder?: () => void;
  onCreateCategory?: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AddToFolderModal: React.FC<AddToFolderModalProps> = ({
  isOpen,
  onOpenChange,
  selectedFileIds,
  customFolders,
  categories,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  onCreateFolder,
  onCreateCategory,
  onSubmit
}) => {
  // Filter folders by selected category
  const filteredFolders = targetCategoryId
    ? customFolders.filter(folder => folder.categoryId === targetCategoryId)
    : [];
    
  // Reset target folder when category changes
  useEffect(() => {
    setTargetFolderId('');
  }, [targetCategoryId, setTargetFolderId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add to Folder</DialogTitle>
          <DialogDescription>
            {selectedFileIds.length > 0
              ? `Add ${selectedFileIds.length} selected ${selectedFileIds.length === 1 ? 'file' : 'files'} to a folder`
              : 'Select files first to add them to a folder'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <div className="col-span-3 space-y-2">
                <Select
                  value={targetCategoryId}
                  onValueChange={setTargetCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {onCreateCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCreateCategory}
                    className="w-full"
                  >
                    Create New Category
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder" className="text-right">
                Folder
              </Label>
              <div className="col-span-3 space-y-2">
                <Select
                  value={targetFolderId}
                  onValueChange={setTargetFolderId}
                  disabled={!targetCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !targetCategoryId
                        ? "Select a category first"
                        : "Select a folder" 
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFolders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {targetCategoryId && filteredFolders.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No folders available in this category.
                  </p>
                )}
                {onCreateFolder && targetCategoryId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCreateFolder}
                    className="w-full"
                  >
                    Create New Folder
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!targetFolderId || selectedFileIds.length === 0}
            >
              Add to Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface FolderModalsProps {
  // Common props
  isAddFolderModalOpen: boolean;
  setIsAddFolderModalOpen: (open: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedCategoryForNewFolder: string;
  setSelectedCategoryForNewFolder: (categoryId: string) => void;
  isAddToFolderModalOpen: boolean;
  setIsAddToFolderModalOpen: (open: boolean) => void;
  targetFolderId: string;
  setTargetFolderId: (id: string) => void;
  targetCategoryId: string;
  setTargetCategoryId: (id: string) => void;
  isDeleteFolderModalOpen: boolean;
  setIsDeleteFolderModalOpen: (open: boolean) => void;
  isRenameFolderModalOpen: boolean;
  setIsRenameFolderModalOpen: (open: boolean) => void;
  folderCurrentName: string;
  selectedFileIds: string[];
  customFolders: Array<{ id: string; name: string; categoryId: string }>;
  categories: Category[];
  handleCreateFolderSubmit: (e: React.FormEvent) => void;
  handleAddToFolderSubmit: (e: React.FormEvent) => void;
  handleDeleteFolder: (folderId: string | null, setIsDeleteFolderModalOpen: (open: boolean) => void, setFolderToDelete: (id: string | null) => void) => void;
  handleRenameFolder: (folderId: string | null, newName: string, setIsRenameFolderModalOpen: (open: boolean) => void, setFolderToRename: (id: string | null) => void) => void;
  handleCreateNewFolder: () => void;
  handleCreateNewCategory?: () => void;
}

export const FolderModals: React.FC<FolderModalsProps> = ({
  isAddFolderModalOpen,
  setIsAddFolderModalOpen,
  newFolderName,
  setNewFolderName,
  selectedCategoryForNewFolder,
  setSelectedCategoryForNewFolder,
  isAddToFolderModalOpen,
  setIsAddToFolderModalOpen,
  targetFolderId,
  setTargetFolderId,
  targetCategoryId,
  setTargetCategoryId,
  isDeleteFolderModalOpen,
  setIsDeleteFolderModalOpen,
  isRenameFolderModalOpen,
  setIsRenameFolderModalOpen,
  folderCurrentName,
  selectedFileIds,
  customFolders,
  categories,
  handleCreateFolderSubmit,
  handleAddToFolderSubmit,
  handleDeleteFolder,
  handleRenameFolder,
  handleCreateNewFolder,
  handleCreateNewCategory
}) => {
  const [folderToDelete, setFolderToDelete] = React.useState<string | null>(null);
  const [folderToRename, setFolderToRename] = React.useState<string | null>(null);
  const [newFolderNameForRename, setNewFolderNameForRename] = React.useState<string>('');
  
  useEffect(() => {
    if (isRenameFolderModalOpen) {
      setNewFolderNameForRename(folderCurrentName);
    }
  }, [isRenameFolderModalOpen, folderCurrentName]);
  
  const onDeleteFolder = () => {
    handleDeleteFolder(folderToDelete, setIsDeleteFolderModalOpen, setFolderToDelete);
  };
  
  const onRenameFolder = () => {
    handleRenameFolder(folderToRename, newFolderNameForRename, setIsRenameFolderModalOpen, setFolderToRename);
  };

  return (
    <>
      {/* Create Folder Modal */}
      <CreateFolderModal 
        isOpen={isAddFolderModalOpen}
        onOpenChange={setIsAddFolderModalOpen}
        folderName={newFolderName}
        setFolderName={setNewFolderName}
        categories={categories}
        selectedCategoryId={selectedCategoryForNewFolder}
        setSelectedCategoryId={setSelectedCategoryForNewFolder}
        onSubmit={handleCreateFolderSubmit}
      />
      
      {/* Add to Folder Modal */}
      <AddToFolderModal
        isOpen={isAddToFolderModalOpen}
        onOpenChange={setIsAddToFolderModalOpen}
        targetFolderId={targetFolderId}
        setTargetFolderId={setTargetFolderId}
        targetCategoryId={targetCategoryId}
        setTargetCategoryId={setTargetCategoryId}
        selectedFileIds={selectedFileIds}
        customFolders={customFolders}
        categories={categories}
        onSubmit={handleAddToFolderSubmit}
        onCreateFolder={handleCreateNewFolder}
        onCreateCategory={handleCreateNewCategory}
      />
      
      {/* Delete Folder Modal */}
      <DeleteModal 
        isOpen={isDeleteFolderModalOpen}
        onOpenChange={(open) => {
          setIsDeleteFolderModalOpen(open);
          if (!open) setFolderToDelete(null);
        }}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Files will be moved to Unsorted Uploads."
        onConfirm={onDeleteFolder}
      />
      
      {/* Rename Folder Modal */}
      <RenameModal
        isOpen={isRenameFolderModalOpen}
        onOpenChange={(open) => {
          setIsRenameFolderModalOpen(open);
          if (!open) setFolderToRename(null);
        }}
        title="Rename Folder"
        currentName={newFolderNameForRename}
        setNewName={setNewFolderNameForRename}
        onConfirm={onRenameFolder}
      />
    </>
  );
};

interface DeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    isOpen,
    onOpenChange,
    title,
    description,
    onConfirm
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <p>Are you sure you want to proceed?</p>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={onConfirm}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface RenameModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    currentName: string;
    setNewName: (name: string) => void;
    onConfirm: () => void;
}

const RenameModal: React.FC<RenameModalProps> = ({
    isOpen,
    onOpenChange,
    title,
    currentName,
    setNewName,
    onConfirm
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Enter a new name.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            New Name
                        </Label>
                        <Input
                            id="name"
                            value={currentName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-3"
                            placeholder="Enter new name"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={onConfirm} disabled={!currentName.trim()}>
                        Rename
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
