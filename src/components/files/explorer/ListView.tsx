
import React from 'react';
import { FileTag } from '@/types/tagTypes';
import { CreatorFileType } from '@/types/fileTypes';
import { Badge } from '@/components/ui/badge';

interface ListViewProps {
  files: CreatorFileType[];
  selectedFileIds: string[];
  onFileClick: (fileId: string) => void;
  onSelectAll: () => void;
  isCreatorView: boolean;
  onFileDeleted: (fileId: string) => void;
  onAddTagToFile: (file: CreatorFileType) => void;
  availableTags: FileTag[];
  getTagNameById: (tagId: string) => string;
  onRefresh: () => void;
  onRemoveFromFolder: (fileIds: string[], folderId: string) => Promise<void>;
  onEditNote: (file: CreatorFileType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  allAvailableTags: FileTag[];
  onTagCreate: (name: string) => Promise<FileTag>;
}

export const ListView: React.FC<ListViewProps> = ({ 
  files,
  selectedFileIds,
  onFileClick,
  onSelectAll,
  isCreatorView,
  onFileDeleted,
  onAddTagToFile,
  availableTags,
  getTagNameById,
  onRefresh,
  onRemoveFromFolder,
  onEditNote,
  searchQuery,
  onSearchChange,
  selectedTypes,
  setSelectedTypes,
  selectedTags,
  setSelectedTags,
  allAvailableTags,
  onTagCreate
}) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 py-2 px-4 font-medium text-sm bg-muted rounded-md">
        <div className="col-span-5">Name</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-3">Tags</div>
        <div className="col-span-2">Actions</div>
      </div>
      
      {files.map(file => (
        <div 
          key={file.id}
          className={`grid grid-cols-12 gap-4 py-2 px-4 rounded-md cursor-pointer ${
            selectedFileIds.includes(file.id) ? 'bg-primary/10' : 'hover:bg-muted/50'
          }`}
          onClick={() => onFileClick(file.id)}
        >
          <div className="col-span-5 truncate">{file.name}</div>
          <div className="col-span-2">{file.type}</div>
          
          <div className="col-span-3">
            {/* File tags - display tag names instead of IDs */}
            <div className="flex flex-wrap gap-1">
              {file.tags && file.tags.length > 0 ? 
                file.tags.map(tagId => (
                  <Badge key={tagId} variant="secondary" className="text-xs">
                    {getTagNameById(tagId)}
                  </Badge>
                )) : 
                <span className="text-muted-foreground text-xs">No tags</span>
              }
            </div>
          </div>
          
          <div className="col-span-2 flex gap-2 justify-end">
            {isCreatorView && (
              <button 
                className="text-xs text-primary hover:underline" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddTagToFile(file);
                }}
              >
                Add tag
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
