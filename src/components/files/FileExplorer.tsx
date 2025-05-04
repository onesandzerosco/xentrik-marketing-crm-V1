
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Upload, Download, FolderPlus, FilePlus2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import FileHeader from './FileHeader';
import FileGrid from './FileGrid';
import FileList from './FileList';
import EmptyState from './EmptyState';
import FileViewSkeleton from './FileViewSkeleton';
import FileUploaderWithProgress from './FileUploaderWithProgress';
import DragDropUploader from './DragDropUploader';
import FolderNav from './FolderNav';
import { FileDownloader } from './FileDownloader';
import { CreatorFileType } from '@/pages/CreatorFiles';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getMediaPermissions } from '@/utils/permissionUtils';

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  onFolderChange: (folder: string) => void;
  currentFolder: string;
  availableFolders: { id: string; name: string }[];
  isCreatorView: boolean;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
  onUploadStart?: () => void;
  recentlyUploadedIds?: string[];
  onCreateFolder?: (folderName: string, fileIds: string[]) => Promise<void>;
  onDeleteFolder?: (folderId: string) => Promise<void>;
  onAddFilesToFolder?: (fileIds: string[], targetFolderId: string) => Promise<void>;
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
  isCreatorView,
  onUploadComplete,
  onUploadStart,
  recentlyUploadedIds = [],
  onCreateFolder,
  onDeleteFolder,
  onAddFilesToFolder
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<CreatorFileType[]>([]);
  const [movingFiles, setMovingFiles] = useState(false);
  const [targetFolder, setTargetFolder] = useState('');
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [currentEditingFile, setCurrentEditingFile] = useState<CreatorFileType | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [isSubmittingDescription, setIsSubmittingDescription] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { userRole, userRoles, isCreatorSelf } = useAuth();
  
  // Get media permissions based on user role
  const permissions = getMediaPermissions(userRole, userRoles, isCreatorSelf);

  // Reset selected files when the folder changes or when files are refreshed
  useEffect(() => {
    setSelectedFiles([]);
  }, [currentFolder, files]);

  const handleFileSelect = (file: CreatorFileType, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFiles(prev => [...prev, file]);
    } else {
      setSelectedFiles(prev => prev.filter(f => f.id !== file.id));
    }
  };

  const handleSelectAllFiles = (selected: boolean) => {
    if (selected) {
      setSelectedFiles([...files]);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      // Delete each file
      for (const file of selectedFiles) {
        // Delete from Supabase storage
        if (file.bucketPath) {
          const { error: storageError } = await supabase.storage
            .from('raw_uploads')
            .remove([file.bucketPath]);
          
          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
          }
        }
        
        // Delete from media table
        const { error: dbError } = await supabase
          .from('media')
          .delete()
          .eq('id', file.id);
        
        if (dbError) {
          console.error('Error deleting file from database:', dbError);
          toast({
            title: 'Error',
            description: `Failed to delete ${file.name}`,
            variant: 'destructive',
          });
          continue;
        }
      }
      
      toast({
        title: 'Files deleted',
        description: `Successfully deleted ${selectedFiles.length} file(s)`,
      });
      
      // Clear selected files and refresh
      setSelectedFiles([]);
      onRefresh();
      
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete selected files',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNewFolder = async () => {
    if (!newFolderName || !onCreateFolder) {
      return;
    }
    
    try {
      await onCreateFolder(newFolderName, selectedFiles.map(file => file.id));
      setNewFolderName('');
      setSelectedFiles([]);
      setShowNewFolderDialog(false);
      
      toast({
        title: 'Folder created',
        description: `Created folder: ${newFolderName}`,
      });
      
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    }
  };

  const handleAddToFolder = async () => {
    if (!targetFolder || !onAddFilesToFolder || selectedFiles.length === 0) {
      return;
    }
    
    setMovingFiles(true);
    
    try {
      await onAddFilesToFolder(selectedFiles.map(file => file.id), targetFolder);
      
      setMovingFiles(false);
      setSelectedFiles([]);
      setTargetFolder('');
      
      toast({
        title: 'Files moved',
        description: `Successfully added ${selectedFiles.length} file(s) to folder`,
      });
      
    } catch (error) {
      setMovingFiles(false);
      console.error('Error moving files:', error);
      toast({
        title: 'Error',
        description: 'Failed to move files to folder',
        variant: 'destructive',
      });
    }
  };

  // Function to handle opening the description dialog
  const handleEditDescription = (file: CreatorFileType) => {
    setCurrentEditingFile(file);
    setNewDescription(file.description || '');
    setIsDescriptionDialogOpen(true);
  };

  // Function to save the updated description
  const handleSaveDescription = async () => {
    if (!currentEditingFile) return;
    
    setIsSubmittingDescription(true);
    
    try {
      const { error } = await supabase
        .from('media')
        .update({ description: newDescription })
        .eq('id', currentEditingFile.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Description updated',
        description: 'File description has been updated successfully',
      });
      
      // Close the dialog and refresh files to show updated description
      setIsDescriptionDialogOpen(false);
      setCurrentEditingFile(null);
      onRefresh();
      
    } catch (error) {
      console.error('Error updating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to update file description',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingDescription(false);
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' ? 
        a.name.localeCompare(b.name) : 
        b.name.localeCompare(a.name);
    } else if (sortBy === 'size') {
      return sortDirection === 'asc' ? 
        a.size - b.size : 
        b.size - a.size;
    } else { // date
      return sortDirection === 'asc' ? 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime() : 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  // Highlight files that were recently uploaded
  const highlightedFiles = sortedFiles.map(file => ({
    ...file,
    isHighlighted: recentlyUploadedIds.includes(file.id)
  }));

  return (
    <div className="space-y-4">
      <FileHeader
        creatorName={creatorName}
        viewMode={viewMode}
        setViewMode={setViewMode}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        selectedFilesCount={selectedFiles.length}
        onRefresh={onRefresh}
      />
      
      <FolderNav
        folders={availableFolders}
        currentFolder={currentFolder}
        onFolderChange={onFolderChange}
        onDeleteFolder={onDeleteFolder}
      />
      
      <div className="flex flex-wrap gap-2">
        {permissions.canUpload && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </Button>
        )}
        
        {permissions.canDownload && selectedFiles.length > 0 && (
          <FileDownloader files={selectedFiles}>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Download ({selectedFiles.length})</span>
            </Button>
          </FileDownloader>
        )}
        
        {permissions.canDelete && selectedFiles.length > 0 && (
          <Button 
            variant="destructive" 
            className="flex items-center gap-2" 
            onClick={handleDeleteFiles}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete ({selectedFiles.length})</span>
          </Button>
        )}
        
        {onCreateFolder && selectedFiles.length > 0 && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setShowNewFolderDialog(true)}
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Folder with Selected</span>
          </Button>
        )}
        
        {onAddFilesToFolder && selectedFiles.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <FilePlus2 className="w-4 h-4" />
                <span>Add to Folder</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select destination</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableFolders
                .filter(folder => folder.id !== 'shared' && folder.id !== currentFolder)
                .map(folder => (
                  <DropdownMenuItem
                    key={folder.id}
                    onClick={() => {
                      setTargetFolder(folder.id);
                      handleAddToFolder();
                    }}
                  >
                    {folder.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isLoading ? (
        <FileViewSkeleton viewMode={viewMode} />
      ) : files.length === 0 ? (
        <EmptyState 
          showUploadButton={permissions.canUpload} 
          onUploadClick={() => fileInputRef.current?.click()} 
        />
      ) : viewMode === 'grid' ? (
        <FileGrid 
          files={highlightedFiles} 
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onSelectAll={handleSelectAllFiles}
          onEditDescription={permissions.canEdit ? handleEditDescription : undefined}
          showDownloadAction={permissions.canDownload}
          showDeleteAction={permissions.canDelete}
        />
      ) : (
        <FileList 
          files={highlightedFiles}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onSelectAll={handleSelectAllFiles}
          onEditDescription={permissions.canEdit ? handleEditDescription : undefined}
          showDownloadAction={permissions.canDownload}
          showDeleteAction={permissions.canDelete}
        />
      )}

      {permissions.canUpload && (
        <FileUploaderWithProgress
          id="file-uploader"
          creatorId={creatorId}
          onUploadComplete={onUploadComplete}
          currentFolder={currentFolder}
        />
      )}
      
      {permissions.canUpload && (
        <DragDropUploader
          creatorId={creatorId}
          onUploadStart={onUploadStart}
          onUploadComplete={onUploadComplete}
          currentFolder={currentFolder}
        />
      )}
      
      <input
        ref={fileInputRef}
        id="file-uploader"
        type="file"
        onChange={() => {}}
        multiple
        className="hidden"
      />

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {selectedFiles.length} file(s) will be added to this folder
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewFolder} disabled={!newFolderName}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Description Dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Description</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="file-name">File Name</Label>
              <Input
                id="file-name"
                value={currentEditingFile?.name || ''}
                readOnly
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="file-description">Description</Label>
              <Textarea
                id="file-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter file description"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveDescription} 
              disabled={isSubmittingDescription}
            >
              {isSubmittingDescription ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Description'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
