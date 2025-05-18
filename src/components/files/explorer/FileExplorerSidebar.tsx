import React from 'react';
import { Category, Folder } from '@/types/fileTypes';

interface FileExplorerSidebarProps {
  onFolderChange: (folderId: string) => void;
  currentFolder: string;
  onCategoryChange: (categoryId: string | null) => void;
  currentCategory: string | null;
  availableFolders: Folder[];
  availableCategories: Category[];
  onCreateFolder?: () => void;
}

export const FileExplorerSidebar: React.FC<FileExplorerSidebarProps> = ({
  onFolderChange,
  currentFolder,
  onCategoryChange,
  currentCategory,
  availableFolders,
  availableCategories,
  onCreateFolder,
}) => {
  return (
    <div className="w-64 border-r p-4">
      <h3 className="font-semibold mb-2">Categories</h3>
      <ul>
        <li
          className={`cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
            currentCategory === null ? 'bg-gray-200' : ''
          }`}
          onClick={() => onCategoryChange(null)}
        >
          All Categories
        </li>
        {availableCategories.map((category) => (
          <li
            key={category.id}
            className={`cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
              currentCategory === category.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.name}
          </li>
        ))}
      </ul>

      <h3 className="font-semibold mt-4 mb-2">Folders</h3>
      <ul>
        <li
          className={`cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
            currentFolder === 'all' ? 'bg-gray-200' : ''
          }`}
          onClick={() => onFolderChange('all')}
        >
          All Files
        </li>
        <li
          className={`cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
            currentFolder === 'unsorted' ? 'bg-gray-200' : ''
          }`}
          onClick={() => onFolderChange('unsorted')}
        >
          Unsorted
        </li>
        {availableFolders.map((folder) => (
          <li
            key={folder.id}
            className={`cursor-pointer hover:bg-gray-100 p-2 rounded-md ${
              currentFolder === folder.id ? 'bg-gray-200' : ''
            }`}
            onClick={() => onFolderChange(folder.id)}
          >
            {folder.name}
          </li>
        ))}
      </ul>
      {onCreateFolder && (
        <button
          onClick={onCreateFolder}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create Folder
        </button>
      )}
    </div>
  );
};
