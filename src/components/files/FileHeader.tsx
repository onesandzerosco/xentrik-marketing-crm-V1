
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, LayoutGrid, List, SlidersHorizontal, Search as SearchIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { canUploadFiles } from '@/utils/permissionUtils';
import { ZipFileUploader } from './ZipFileUploader';

interface FileHeaderProps {
  creatorId: string;
  creatorName: string;
  isGridView: boolean;
  toggleView: () => void;
  handleUploadClick: () => void;
  handleCreateFolder: () => void;
  currentFolder: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onFilesUploaded?: (fileIds: string[]) => void;
}

const FileHeader: React.FC<FileHeaderProps> = ({
  creatorId,
  creatorName,
  isGridView, 
  toggleView,
  handleUploadClick,
  handleCreateFolder,
  currentFolder,
  searchQuery,
  setSearchQuery,
  onFilesUploaded
}) => {
  const { userRole, userRoles } = useAuth();
  const canUpload = canUploadFiles(userRole, userRoles || []);  // Added fallback empty array for userRoles

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {creatorName}'s Files
        </h1>
        
        <div className="flex items-center space-x-2">
          {canUpload && (
            <>
              <Button
                onClick={handleUploadClick}
                size="sm"
                className="flex gap-1.5 items-center"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              
              <ZipFileUploader 
                creatorId={creatorId}
                currentFolder={currentFolder}
                onExtractComplete={(fileIds) => {
                  if (onFilesUploaded) {
                    onFilesUploaded(fileIds);
                  }
                }}
              />
              
              <Button
                onClick={handleCreateFolder}
                variant="outline"
                size="sm"
                className="flex gap-1.5 items-center"
              >
                <FolderPlus className="h-4 w-4" />
                <span>New Folder</span>
              </Button>
            </>
          )}
          
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={isGridView ? "default" : "ghost"}
              size="sm"
              onClick={() => !isGridView && toggleView()}
              className="rounded-none px-2.5 h-9"
            >
              <LayoutGrid className={`h-4 w-4 ${!isGridView ? 'text-muted-foreground' : ''}`} />
            </Button>
            <Button
              variant={!isGridView ? "default" : "ghost"}
              size="sm"
              onClick={() => isGridView && toggleView()}
              className="rounded-none px-2.5 h-9"
            >
              <List className={`h-4 w-4 ${isGridView ? 'text-muted-foreground' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" title="Filter">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default FileHeader;
