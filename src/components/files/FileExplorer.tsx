
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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
  onMoveFilesToFolder?: (fileIds: string[], folderId: string) => Promise<void>;
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
  onCreateFolder,
  onMoveFilesToFolder
}) => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string>('');
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

  const handleFileSelection = (fileIds: string[]) => {
    setSelectedFiles(fileIds);
  };

  const handleMoveSelectedFiles = async () => {
    if (!targetFolder || selectedFiles.length === 0) {
      return;
    }

    try {
      if (onMoveFilesToFolder) {
        await onMoveFilesToFolder(selectedFiles, targetFolder);
      }
      
      setShowMoveDialog(false);
      setSelectedFiles([]);
      setTargetFolder('');
      
      toast({
        title: "Files moved",
        description: `Successfully moved ${selectedFiles.length} files to folder`,
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error moving files:", error);
      toast({
        title: "Error moving files",
        description: "Failed to move files to the selected folder",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <FileHeader 
        creatorName={creatorName}
        onUploadClick={isCreatorView ? handleUploadClick : undefined}
        isCreatorView={isCreatorView}
        selectedFiles={selectedFiles.length}
        onMoveFilesClick={() => {
          if (selectedFiles.length > 0) {
            setShowMoveDialog(true);
          }
        }}
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
                  onSelectFiles={handleFileSelection}
                />
              ) : (
                <FileGrid 
                  files={filteredFiles} 
                  isCreatorView={isCreatorView} 
                  onFilesChanged={handleFilesChanged}
                  recentlyUploadedIds={recentlyUploadedIds}
                  onUploadClick={isCreatorView ? handleUploadClick : undefined}
                  onSelectFiles={handleFileSelection}
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

      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Files to Folder</DialogTitle>
            <DialogDescription>
              Select a destination folder for the {selectedFiles.length} selected files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder">Destination Folder</Label>
              <Select 
                value={targetFolder} 
                onValueChange={setTargetFolder}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {availableFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>Cancel</Button>
            <Button onClick={handleMoveSelectedFiles} disabled={!targetFolder}>
              Move Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
