import React, { useState, useEffect } from 'react';
import { Upload, RefreshCw, Search, Folder } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileGrid } from '@/components/files/FileGrid';
import { FileList } from '@/components/files/FileList';
import { FolderNav } from '@/components/files/FolderNav';
import { EmptyState } from '@/components/files/EmptyState';
import { FileViewSkeleton } from '@/components/files/FileViewSkeleton';
import FileUploader from '@/components/messages/FileUploader';
import DragDropUploader from '@/components/files/DragDropUploader';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";
import { BackButton } from "@/components/ui/back-button";
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useAuth } from '@/context/AuthContext';

interface FolderType {
  id: string;
  name: string;
}

interface FileExplorerProps {
  files: CreatorFileType[];
  creatorName: string;
  creatorId: string;
  isLoading: boolean;
  onRefresh: () => void;
  currentFolder?: string;
  onFolderChange?: (folder: string) => void;
  availableFolders?: FolderType[];
  isCreatorView?: boolean;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  creatorName,
  creatorId,
  isLoading,
  onRefresh,
  currentFolder = 'shared',
  onFolderChange,
  availableFolders = [{ id: 'shared', name: 'Shared Files' }],
  isCreatorView = false
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserCreator, setIsUserCreator] = useState(isCreatorView);
  const [showUploader, setShowUploader] = useState(false);
  const { toast } = useToast();
  const { user, isCreator, creatorId: authCreatorId, userRole, userRoles = [] } = useSupabaseAuth();
  const { isCreatorSelf } = useAuth();

  useEffect(() => {
    // Check if current user is the creator or has Creator role
    const checkCreatorStatus = async () => {
      // Check if globally authenticated as a creator and if this is their profile
      if (isCreator && authCreatorId === creatorId) {
        setIsUserCreator(true);
        return;
      }
      
      // Check if user is the creator themselves (exact match on ID)
      if (user?.id === creatorId) {
        setIsUserCreator(true);
        return;
      }

      // Check if user has Creator role in their roles array
      if (userRoles.includes('Creator')) {
        setIsUserCreator(true);
        return;
      }
      
      // If user has Admin role, they can manage all creators
      if (userRole === 'Admin' || userRoles.includes('Admin')) {
        setIsUserCreator(true);
        return;
      }
      
      // Otherwise check through the database
      if (user) {
        const { data: creatorTeamMembers } = await supabase
          .from('creator_team_members')
          .select('creator_id')
          .eq('team_member_id', user.id)
          .eq('creator_id', creatorId)
          .limit(1);
          
        if (creatorTeamMembers && creatorTeamMembers.length > 0) {
          setIsUserCreator(true);
        }
      }
    };

    checkCreatorStatus();
  }, [creatorId, user, isCreator, authCreatorId, userRoles, userRole]);

  // Check if user can upload files (either has Admin role or Creator role)
  const canUpload = userRole === 'Admin' || 
                   userRoles.includes('Admin') || 
                   userRoles.includes('Creator') || 
                   isUserCreator || 
                   isCreatorSelf;

  const handleUploadFile = () => {
    setShowUploader(true);
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing files",
      description: "Getting the latest files..."
    });
    onRefresh();
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Determine if backButton should go to shared-files or dashboard
  const backLink = isCreatorSelf ? "/dashboard" : "/shared-files";

  return (
    <div className="flex h-[calc(100vh-70px)] overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r p-4">
        <BackButton to={backLink} className="mb-4" />
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Folders</h3>
            <div className="space-y-1">
              {availableFolders.map(folder => (
                <Button
                  key={folder.id}
                  variant={currentFolder === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm"
                  onClick={() => onFolderChange?.(folder.id)}
                >
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                </Button>
              ))}
            </div>
          </div>
          <FolderNav 
            activeFolder={currentFolder || null} 
            onFolderChange={(folder) => {
              if (folder && onFolderChange) {
                onFolderChange(folder);
              }
            }} 
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-shrink-0">
              <h1 className="text-xl font-semibold truncate">{isCreatorSelf ? 'My Files' : `${creatorName}'s Files`}</h1>
              <p className="text-sm text-muted-foreground">
                {availableFolders.find(f => f.id === currentFolder)?.name || 'Files'}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="relative w-64 min-w-0 flex-1 max-w-md">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search files..." 
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="flex-shrink-0"
                >
                  {viewMode === 'grid' ? 'List View' : 'Grid View'}
                </Button>
                {canUpload && (
                  <Button 
                    onClick={handleUploadFile}
                    variant="default"
                    className="px-4 flex-shrink-0"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Files area */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <FileViewSkeleton viewMode={viewMode} />
          ) : filteredFiles.length > 0 ? (
            viewMode === 'grid' ? (
              <FileGrid files={filteredFiles} isCreatorView={canUpload} />
            ) : (
              <FileList files={filteredFiles} isCreatorView={canUpload} />
            )
          ) : (
            <EmptyState isFiltered={!!searchQuery} isCreatorView={canUpload} />
          )}
        </div>
      </div>
      
      {/* Hidden file input for simple upload method */}
      {canUpload && (
        <div className="hidden">
          <FileUploader 
            id="file-upload-trigger" 
            creatorId={creatorId} 
            onUploadComplete={onRefresh}
            folder={currentFolder}
            bucket="raw_uploads"
          />
        </div>
      )}

      {/* Drag & Drop Uploader Component */}
      {showUploader && (
        <DragDropUploader
          creatorId={creatorId}
          folder={currentFolder}
          bucket="raw_uploads"
          onUploadComplete={() => {
            setShowUploader(false);
            onRefresh();
          }}
          onCancel={() => setShowUploader(false)}
        />
      )}
    </div>
  );
};
