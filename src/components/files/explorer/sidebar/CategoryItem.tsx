
import React from 'react';
import { ChevronDown, ChevronRight, Pencil, Trash2, FolderPlus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Folder {
  id: string;
  name: string;
  categoryId: string;
}

interface CategoryItemProps {
  category: { id: string; name: string };
  isExpanded: boolean;
  currentCategory: string | null;
  currentFolder: string;
  folders: Folder[];
  canManageFolders: boolean;
  onToggle: (e: React.MouseEvent, categoryId: string) => void;
  onFolderChange: (folderId: string) => void;
  onNewFolderClick: (e: React.MouseEvent, categoryId: string) => void;
  onRenameCategory: (e: React.MouseEvent, categoryId: string, currentName: string) => void;
  onDeleteCategory: (e: React.MouseEvent, categoryId: string) => void;
  onRenameFolder: (e: React.MouseEvent, folderId: string, currentName: string) => void;
  onDeleteFolder: (e: React.MouseEvent, folderId: string) => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isExpanded,
  currentCategory,
  currentFolder,
  folders,
  canManageFolders,
  onToggle,
  onFolderChange,
  onNewFolderClick,
  onRenameCategory,
  onDeleteCategory,
  onRenameFolder,
  onDeleteFolder
}) => {
  const categoryFolders = folders.filter(folder => folder.categoryId === category.id);
  const hasNoFolders = categoryFolders.length === 0;
  
  return (
    <div className="mb-1">
      <div 
        className={`flex items-center px-3 py-1.5 cursor-pointer group hover:bg-accent hover:text-accent-foreground rounded-md ${
          currentCategory === category.id && currentFolder === 'all' ? 'bg-muted' : ''
        }`}
        onClick={(e) => onToggle(e, category.id)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 mr-1 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-1 shrink-0" />
        )}
        <span className="text-sm flex-1 truncate">{category.name}</span>
        
        {/* Category actions */}
        {canManageFolders && (
          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => onNewFolderClick(e, category.id)}
              title="New folder"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => onRenameCategory(e, category.id, category.name)}
              title="Rename category"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => onDeleteCategory(e, category.id)}
              title="Delete category"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Folders under this category */}
      {isExpanded && (
        <FoldersList 
          categoryFolders={categoryFolders}
          hasNoFolders={hasNoFolders}
          categoryId={category.id}
          currentFolder={currentFolder}
          canManageFolders={canManageFolders}
          onFolderChange={onFolderChange}
          onNewFolderClick={onNewFolderClick}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      )}
    </div>
  );
};

interface FoldersListProps {
  categoryFolders: Folder[];
  hasNoFolders: boolean;
  categoryId: string;
  currentFolder: string;
  canManageFolders: boolean;
  onFolderChange: (folderId: string) => void;
  onNewFolderClick: (e: React.MouseEvent, categoryId: string) => void;
  onRenameFolder: (e: React.MouseEvent, folderId: string, currentName: string) => void;
  onDeleteFolder: (e: React.MouseEvent, folderId: string) => void;
}

const FoldersList: React.FC<FoldersListProps> = ({
  categoryFolders,
  hasNoFolders,
  categoryId,
  currentFolder,
  canManageFolders,
  onFolderChange,
  onNewFolderClick,
  onRenameFolder,
  onDeleteFolder
}) => {
  if (hasNoFolders) {
    return (
      <div className="ml-6 mt-1">
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No folders yet
          {canManageFolders && (
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto text-xs ml-2 font-medium"
              onClick={(e) => onNewFolderClick(e, categoryId)}
            >
              Create folder
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="ml-6 mt-1 space-y-1">
      {categoryFolders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          currentFolder={currentFolder}
          canManageFolders={canManageFolders}
          onFolderChange={onFolderChange}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
        />
      ))}
    </div>
  );
};

interface FolderItemProps {
  folder: Folder;
  currentFolder: string;
  canManageFolders: boolean;
  onFolderChange: (folderId: string) => void;
  onRenameFolder: (e: React.MouseEvent, folderId: string, currentName: string) => void;
  onDeleteFolder: (e: React.MouseEvent, folderId: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  currentFolder,
  canManageFolders,
  onFolderChange,
  onRenameFolder,
  onDeleteFolder
}) => {
  return (
    <div 
      className={`flex items-center px-3 py-1.5 rounded-md cursor-pointer group hover:bg-accent hover:text-accent-foreground ${
        currentFolder === folder.id ? 'bg-secondary text-secondary-foreground' : ''
      }`}
      onClick={() => onFolderChange(folder.id)}
    >
      <span className="text-sm flex-1 truncate">{folder.name}</span>
      
      {/* Folder actions */}
      {canManageFolders && (
        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => onRenameFolder(e, folder.id, folder.name)}
            title="Rename folder"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => onDeleteFolder(e, folder.id)}
            title="Delete folder"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )}
    </div>
  );
};
