
import React from 'react';
import { FileTag } from '@/types/tagTypes';
import { CreatorFileType } from '@/types/fileTypes';
import { Badge } from '@/components/ui/badge';

interface GridViewProps {
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

export const GridView: React.FC<GridViewProps> = ({ 
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {files.map(file => (
        <div 
          key={file.id}
          className={`border rounded-lg p-4 cursor-pointer ${
            selectedFileIds.includes(file.id) ? 'bg-primary/10 border-primary' : 'bg-card'
          }`}
          onClick={() => onFileClick(file.id)}
        >
          <div className="flex flex-col h-full">
            <div className="font-medium mb-2 truncate">{file.name}</div>
            
            {/* File tags - display tag names instead of IDs */}
            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {file.tags.map(tagId => (
                  <Badge key={tagId} variant="secondary" className="text-xs">
                    {getTagNameById(tagId)}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* File actions */}
            <div className="mt-auto pt-2">
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{file.type}</span>
                {isCreatorView && (
                  <button 
                    className="text-primary hover:underline" 
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
          </div>
        </div>
      ))}
    </div>
  );
};
