
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
  onCreateFolder?: (folderName: string) => void;
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
  recentlyUploadedIds = [],
  onCreateFolder
}) => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
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

  const handleCreateFolder = (folderName: string) => {
    if (onCreateFolder) {
      onCreateFolder(folderName);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={isCreatorView ? handleUploadClick : undefined}
        isCreatorView={isCreatorView}
      />
      
      <div className="flex h-full">
        {/* Left sidebar for folder navigation */}
        <div className="w-64 p-4 border-r">
          <FolderNav 
            folders={availableFolders}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            onCreateFolder={isCreatorView ? handleCreateFolder : undefined}
          />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 p-6">
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
                onUploadClick={isCreatorView ? handleUploadClick : undefined}
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
                  onUploadClick={isCreatorView ? handleUploadClick : undefined}
                />
              )
            ) : (
              <EmptyState 
                currentFolder={currentFolder} 
                onUploadClick={isCreatorView ? handleUploadClick : undefined}
                isCreatorView={isCreatorView}
                isFiltered={searchQuery.length > 0}
              />
            )}
          </div>
        </div>
      </div>
      
      {showUploader && (
        <DragDropUploader 
          creatorId={creatorId}
          onUploadComplete={handleUploadComplete}
          onCancel={() => setShowUploader(false)}
          currentFolder={currentFolder}
        />
      )}
    </div>
  );
};
