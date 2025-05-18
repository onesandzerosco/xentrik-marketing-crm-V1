
import React from 'react';
import { CreatorFileType } from '@/types/fileTypes';

interface FileCardProps {
  file: CreatorFileType;
  isCreatorView: boolean;
  onFilesChanged: () => void;
  onFileDeleted: (fileId: string) => Promise<void>;
  isNewlyUploaded?: boolean;
  onEditNote?: (file: CreatorFileType) => void;
  onAddTag?: (file: CreatorFileType) => void;
  currentFolder?: string;
  onRemoveFromFolder?: (fileIds: string[], folderId: string) => Promise<void>;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isCreatorView,
  onFilesChanged,
  onFileDeleted,
  isNewlyUploaded = false,
  onEditNote,
  onAddTag,
  currentFolder,
  onRemoveFromFolder
}) => {
  // This is a placeholder component since the original wasn't provided
  // but we need to ensure it has proper type definitions
  return (
    <div className="border rounded-md p-4">
      <h3>{file.name || file.filename}</h3>
      {isNewlyUploaded && <span className="text-green-500">New</span>}
      <div className="mt-2 flex space-x-2">
        {isCreatorView && (
          <>
            {onEditNote && (
              <button 
                className="text-blue-500"
                onClick={() => onEditNote(file)}
              >
                Edit Note
              </button>
            )}
            {onAddTag && (
              <button 
                className="text-purple-500"
                onClick={() => onAddTag(file)}
              >
                Add Tag
              </button>
            )}
            {currentFolder && currentFolder !== 'all' && onRemoveFromFolder && (
              <button 
                className="text-red-500"
                onClick={() => onRemoveFromFolder([file.id], currentFolder)}
              >
                Remove from folder
              </button>
            )}
            <button 
              className="text-red-500"
              onClick={() => onFileDeleted(file.id)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};
