
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import FileHeader from '@/components/files/FileHeader';
import { FolderNav, FolderType } from '@/components/files/FolderNav';
import FileUploader from '@/components/messages/FileUploader';
import FileUploaderWithProgress from '@/components/files/FileUploaderWithProgress';
import { FileDownloader } from '@/components/files/FileDownloader';
import { getFileType, getFileExtension } from '@/utils/fileUtils';
import { canUploadFiles } from '@/utils/permissionUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface CreatorFileType {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucketPath?: string;
  description?: string;
  thumbnail_url?: string;
  status?: string;
  created_at?: string;
}

const CreatorFiles = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth(); // Correctly use useAuth
  
  const [files, setFiles] = useState<CreatorFileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderHierarchy, setFolderHierarchy] = useState<FolderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGridView, setIsGridView] = useState(true);
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreator, setIsCreator] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<CreatorFileType[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<CreatorFileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [recentlyExtractedIds, setRecentlyExtractedIds] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if the current user is the creator or has admin rights
  useEffect(() => {
    const checkCreatorStatus = async () => {
      if (!id) return;
      
      try {
        // Check if user is the creator
        const { data: creatorData, error: creatorError } = await supabase
          .from('creators')
          .select('name')
          .eq('id', id)
          .single();
          
        if (creatorError) throw creatorError;
        
        if (creatorData) {
          setCreatorName(creatorData.name);
          
          // Check if current user has the right role
          const isUserAdmin = user?.role === "Admin";
          const isUserVA = user?.role === "VA" || user?.roles?.includes("VA");
          
          setIsCreator(isUserAdmin || isUserVA);
        }
      } catch (error) {
        console.error('Error checking creator status:', error);
      }
    };
    
    checkCreatorStatus();
  }, [id, user]);

  // Get creator name from location state if available
  useEffect(() => {
    if (location.state?.creatorName && !creatorName) {
      setCreatorName(location.state.creatorName);
    }
  }, [location.state, creatorName]);

  // Fetch folders for this creator
  useEffect(() => {
    const fetchFolders = async () => {
      if (!id) return;
      
      try {
        // First get folders from the database
        const { data: folderData, error } = await supabase
          .from('teams') // Using teams temporarily as a folder table
          .select('id, team_name')
          .order('team_name', { ascending: true });
          
        if (error) throw error;
        
        // Map team data to folder structure
        const mappedFolders: FolderType[] = (folderData || []).map(team => ({
          id: team.id, 
          name: team.team_name,
          parent_id: null
        }));
        
        // Add a "shared" root folder
        const sharedFolder: FolderType = {
          id: 'shared',
          name: 'shared',
          parent_id: null
        };
        
        // Add an "unsorted" folder
        const unsortedFolder: FolderType = {
          id: 'unsorted',
          name: 'unsorted',
          parent_id: null
        };
        
        setFolders([sharedFolder, unsortedFolder, ...mappedFolders]);
        
        // Set initial folder to "shared"
        setCurrentFolder(sharedFolder);
        setCurrentFolderId('shared');
        
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast({
          title: 'Error',
          description: 'Failed to load folders',
          variant: 'destructive',
        });
      }
    };
    
    fetchFolders();
  }, [id, toast]);

  // Fetch files when folder changes
  useEffect(() => {
    if (currentFolderId) {
      fetchFiles(currentFolderId);
    }
  }, [currentFolderId]);

  // Filter files when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFiles(files);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = files.filter(file => 
        file.name.toLowerCase().includes(query) || 
        (file.description && file.description.toLowerCase().includes(query))
      );
      setFilteredFiles(filtered);
    }
  }, [files, searchQuery]);

  // Build folder hierarchy when current folder changes
  useEffect(() => {
    if (!currentFolder || !folders.length) return;
    
    const buildHierarchy = (folder: FolderType): FolderType[] => {
      if (!folder || folder.parent_id === null) {
        return [folder];
      }
      
      const parent = folders.find(f => f.id === folder.parent_id);
      if (!parent) return [folder];
      
      return [...buildHierarchy(parent), folder];
    };
    
    const hierarchy = buildHierarchy(currentFolder);
    setFolderHierarchy(hierarchy);
  }, [currentFolder, folders]);

  const fetchFiles = async (folderId = currentFolderId) => {
    if (!id) return;
    
    setIsLoading(true);
    
    try {
      let folderPath = 'shared';
      
      // If not the shared folder, get the actual folder name
      if (folderId !== 'shared') {
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
          folderPath = folder.name;
        }
      }
      
      // Fetch files from the media table
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('*')
        .eq('creator_id', id)
        .order('created_at', { ascending: false });
        
      if (mediaError) throw mediaError;
      
      // Filter files based on folder
      let folderFiles = mediaData || [];
      
      if (folderId === 'shared') {
        // For shared folder, show files with empty folders array or containing 'shared'
        folderFiles = folderFiles.filter(file => 
          !file.folders || 
          file.folders.length === 0 || 
          file.folders.includes('shared')
        );
      } else {
        // For other folders, filter by folder name
        folderFiles = folderFiles.filter(file => 
          file.folders && file.folders.includes(folderPath)
        );
      }
      
      // Get URLs for each file
      const filesWithUrls = await Promise.all(folderFiles.map(async (file) => {
        // Get the file URL
        const { data: urlData } = supabase.storage
          .from('raw_uploads')
          .getPublicUrl(file.bucket_key);
          
        // Determine file type based on extension
        const extension = getFileExtension(file.filename);
        const fileType = getFileType(extension);
        
        return {
          id: file.id,
          name: file.filename,
          url: urlData.publicUrl,
          size: file.file_size || 0,
          type: fileType,
          bucketPath: file.bucket_key,
          description: file.description || '',
          thumbnail_url: file.thumbnail_url || undefined,
          status: file.status,
          created_at: file.created_at
        };
      }));
      
      setFiles(filesWithUrls);
      setFilteredFiles(filesWithUrls);
      
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderNavigation = (folder: FolderType) => {
    setCurrentFolder(folder);
    setCurrentFolderId(folder.id);
  };

  const toggleView = () => {
    setIsGridView(!isGridView);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleOpenNewFolderDialog = () => {
    setIsNewFolderDialogOpen(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !id) {
      return;
    }
    
    try {
      // Create the folder in the database (currently using teams as a placeholder for folders)
      const { data, error } = await supabase
        .from('teams')
        .insert({
          team_name: newFolderName.trim()
        })
        .select();
        
      if (error) throw error;
      
      // Add the new folder to the list
      if (data && data[0]) {
        const newFolder: FolderType = {
          id: data[0].id,
          name: data[0].team_name,
          parent_id: null
        };
        
        setFolders(prev => [...prev, newFolder]);
        
        toast({
          title: 'Folder created',
          description: `Created folder "${newFolderName}"`,
        });
      }
      
      // Reset the form
      setNewFolderName('');
      setIsNewFolderDialogOpen(false);
      
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    }
  };

  const handleFilesUploaded = (fileIds: string[] = []) => {
    fetchFiles();
    if (fileIds.length > 0) {
      setRecentlyExtractedIds(fileIds);
      // Clear the extracted IDs after a delay
      setTimeout(() => {
        setRecentlyExtractedIds([]);
      }, 5000);
    }
  };

  const canUpload = canUploadFiles(user?.role, user?.roles);

  return (
    <div className="container mx-auto py-8 px-4">
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-10" />
            </div>
          </div>
          
          <Skeleton className="h-10 w-full" />
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <FileHeader
            creatorId={id}
            creatorName={creatorName || 'Creator'}
            isGridView={isGridView}
            toggleView={toggleView}
            handleUploadClick={handleUploadClick}
            handleCreateFolder={handleOpenNewFolderDialog}
            currentFolder={currentFolder?.name || 'shared'}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onFilesUploaded={handleFilesUploaded}
          />

          <FolderNav
            folders={folders}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            folderHierarchy={folderHierarchy}
            onFolderChange={(folderId) => {
              const folder = folders.find(f => f.id === folderId);
              if (folder) {
                handleFolderNavigation(folder);
              } else if (folderId) {
                // Handle string ID (legacy support)
                const defaultFolder = folders.find(f => f.id === folderId) || folders[0];
                if (defaultFolder) {
                  handleFolderNavigation(defaultFolder);
                }
              }
            }}
            onDeleteFolder={async (folderId) => {
              try {
                // Delete the folder
                const { error } = await supabase
                  .from('teams')
                  .delete()
                  .eq('id', folderId);
                  
                if (error) throw error;
                
                // Update the folders list
                setFolders(prev => prev.filter(f => f.id !== folderId));
                
                // If the current folder was deleted, go to shared
                if (currentFolder?.id === folderId) {
                  const sharedFolder = folders.find(f => f.id === 'shared');
                  if (sharedFolder) {
                    handleFolderNavigation(sharedFolder);
                  }
                }
                
                return Promise.resolve();
              } catch (error) {
                console.error('Error deleting folder:', error);
                return Promise.reject(error);
              }
            }}
          />
          
          {isGridView ? (
            <FileGrid
              files={filteredFiles}
              isCreatorView={isCreator}
              onFilesChanged={fetchFiles}
              recentlyUploadedIds={uploadingFiles.map(f => f.id).concat(recentlyExtractedIds)}
              onUploadClick={handleUploadClick}
              onSelectFiles={setSelectedFiles}
            />
          ) : (
            <FileList
              files={filteredFiles}
              isCreatorView={isCreator}
              onFilesChanged={fetchFiles}
              recentlyUploadedIds={uploadingFiles.map(f => f.id).concat(recentlyExtractedIds)}
              onUploadClick={handleUploadClick}
              onSelectFiles={setSelectedFiles}
            />
          )}
          
          {/* New Folder Dialog */}
          <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateFolder}>
                  Create Folder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Hidden file input for uploads */}
          {canUpload && (
            <>
              {/* Regular file uploader */}
              <FileUploader
                id="file-upload-input"
                creatorId={id || ''}
                onUploadComplete={handleFilesUploaded}
                folder={currentFolder?.name || 'shared'}
                bucket="raw_uploads"
              />
              
              {/* Advanced file uploader with progress */}
              <FileUploaderWithProgress
                id="file-upload-progress-input"
                creatorId={id || ''}
                onUploadComplete={handleFilesUploaded}
                currentFolder={currentFolder?.name || 'shared'}
              />
              
              {/* File downloader component */}
              <FileDownloader />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatorFiles;
