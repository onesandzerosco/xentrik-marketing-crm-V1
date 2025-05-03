
import React, { useState } from 'react';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { FileHeader } from './FileHeader';
import { FileList } from './FileList';
import { FileGrid } from './FileGrid';
import { FileViewSkeleton } from './FileViewSkeleton';
import { EmptyState } from './EmptyState';
import { FilterBar } from './FilterBar';
import { FilterButtons } from './FilterButtons';
import { FolderNav } from './FolderNav';
import DragDropUploader from './DragDropUploader';

interface Folder {
  id: string;
  name: string;
}

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folder: string) => void;
  currentFolder: string;
  availableFolders: Folder[];
  isCreatorView?: boolean;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  onFolderChange,
  currentFolder,
  availableFolders,
  isCreatorView = false,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = []
}) => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    setShowUploader(true);
  };
  
  const handleUploadComplete = (uploadedFileIds?: string[]) => {
    setShowUploader(false);
    if (onUploadComplete) {
      onUploadComplete(uploadedFileIds);
    }
    onRefresh();
  };
  
  const handleFilesChanged = () => {
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={handleUploadClick}
        isCreatorView={isCreatorView}
      />
      
      <div className="flex flex-col space-y-4 p-6">
        <FolderNav 
          folders={availableFolders}
          currentFolder={currentFolder}
          onFolderChange={onFolderChange}
        />
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
            <FilterButtons
              view={view}
              onViewChange={setView}
              onRefresh={onRefresh}
            />
          </div>
          
          {isLoading ? (
            <FileViewSkeleton view={view} />
          ) : filteredFiles.length > 0 ? (
            view === 'list' ? (
              <FileList 
                files={filteredFiles} 
                isCreatorView={isCreatorView} 
                onFilesChanged={handleFilesChanged}
                recentlyUploadedIds={recentlyUploadedIds} 
              />
            ) : (
              <FileGrid 
                files={filteredFiles} 
                isCreatorView={isCreatorView} 
                onFilesChanged={handleFilesChanged}
                recentlyUploadedIds={recentlyUploadedIds}
              />
            )
          ) : (
            <EmptyState 
              currentFolder={currentFolder} 
              onUploadClick={handleUploadClick}
              isCreatorView={isCreatorView}
            />
          )}
        </div>
      </div>
      
      {showUploader && (
        <DragDropUploader 
          creatorId={creatorId}
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};
