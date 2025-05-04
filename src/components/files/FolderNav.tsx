
import React from 'react';
import { Button } from '@/components/ui/button';
import { FolderOpen, ChevronRight, FolderPlus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FolderType {
  id: string;
  name: string;
  parent_id: string | null;
}

interface FolderNavProps {
  folders: FolderType[];
  currentFolder: FolderType | null;
  setCurrentFolder?: (folder: FolderType) => void;
  folderHierarchy?: FolderType[];
  onNavigate?: (folder: FolderType) => void;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onInitiateNewFolder?: () => void;
}

export const FolderNav: React.FC<FolderNavProps> = ({
  folders,
  currentFolder,
  folderHierarchy = [],
  onNavigate,
  onDeleteFolder,
  onInitiateNewFolder
}) => {
  const handleFolderClick = (folder: FolderType) => {
    if (onNavigate) {
      onNavigate(folder);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb navigation */}
      <div className="flex items-center text-sm overflow-x-auto pb-2 scrollbar-hide">
        {folderHierarchy.map((folder, index) => (
          <React.Fragment key={folder.id}>
            {index > 0 && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleFolderClick(folder)}
            >
              {folder.name === 'shared' ? 'Shared' : folder.name}
            </Button>
          </React.Fragment>
        ))}
      </div>
      
      {/* Folder list */}
      <div className="space-y-1">
        {folders
          .filter(folder => folder.parent_id === (currentFolder?.id !== 'shared' ? currentFolder?.id : null))
          .map(folder => (
            <div 
              key={folder.id} 
              className="flex items-center justify-between group"
            >
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start pl-2 pr-1 py-1 h-8 text-left"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="flex items-center w-full truncate">
                  <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="truncate">
                    {folder.name === 'shared' ? 'Shared' : folder.name}
                  </span>
                </div>
              </Button>
              
              {/* Delete folder action */}
              {onDeleteFolder && folder.id !== 'shared' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteFolder(folder.id)}
                      >
                        <span className="sr-only">Delete {folder.name}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete folder</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        
        {/* New folder button */}
        {onInitiateNewFolder && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start pl-2 py-1 h-8 text-left text-muted-foreground hover:text-foreground"
            onClick={onInitiateNewFolder}
          >
            <div className="flex items-center">
              <FolderPlus className="h-4 w-4 mr-2" />
              <span>New folder</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
};
