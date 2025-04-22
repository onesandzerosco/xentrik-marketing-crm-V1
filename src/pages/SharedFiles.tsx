
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import FileUploader from '@/components/messages/FileUploader';
import { useAuth } from '@/context/AuthContext';
import { FileUp, File, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Define a type for the shared folder data
interface SharedFolder {
  id: string;
  creator_id: string;
  folder_path: string;
  share_code: string;
  created_at: string;
  expires_at: string;
  allow_uploads: boolean;
  allow_downloads: boolean;
  allow_deletes: boolean;
}

interface SharedFile {
  name: string;
  size: number;
  created_at: string;
  url: string;
}

const SharedFiles = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedFolder, setSharedFolder] = useState<SharedFolder | null>(null);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // If we're on the shared-files route (without a shareCode), we'll just show all files the user has access to
  const isSharedFilesPage = !shareCode;
  const userId = user?.id;

  const loadSharedFiles = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Using any type assertion to bypass type checking
      const { data: filesData, error: filesError } = await (supabase.storage as any)
        .from('creator_files')
        .list(`${userId}/shared`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (filesError) throw filesError;

      // Get URLs for each file
      const filesWithUrls = await Promise.all(
        filesData.map(async (file: any) => {
          const { data } = await supabase.storage
            .from('creator_files')
            .createSignedUrl(`${userId}/shared/${file.name}`, 3600);

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            url: data?.signedUrl || '',
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading files:', error);
      setError(error instanceof Error ? error.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const loadSharedFolder = async () => {
    if (!shareCode) return;
    
    try {
      // Using any type assertion to bypass type checking
      const { data, error } = await (supabase as any)
        .from('shared_folders')
        .select('*')
        .eq('share_code', shareCode)
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Shared folder not found');

      // Check if the share link has expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error('This share link has expired');
      }

      // Type assertion to SharedFolder
      setSharedFolder(data as SharedFolder);

      // Load files from this shared folder
      const { data: filesData, error: filesError } = await (supabase.storage as any)
        .from('creator_files')
        .list(`${data.creator_id}/${data.folder_path}`, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (filesError) throw filesError;

      // Get URLs for each file
      const filesWithUrls = await Promise.all(
        filesData.map(async (file: any) => {
          const { data: urlData } = await supabase.storage
            .from('creator_files')
            .createSignedUrl(`${data.creator_id}/${data.folder_path}/${file.name}`, 3600);

          return {
            name: file.name,
            size: file.metadata?.size || 0,
            created_at: file.created_at,
            url: urlData?.signedUrl || '',
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading shared folder:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSharedFilesPage) {
      loadSharedFiles();
    } else {
      loadSharedFolder();
    }
  }, [shareCode, userId]);

  const handleDeleteFile = async (fileName: string) => {
    if (!userId) return;
    
    try {
      const path = isSharedFilesPage
        ? `${userId}/shared/${fileName}`
        : `${sharedFolder?.creator_id}/${sharedFolder?.folder_path}/${fileName}`;
      
      // Delete the file from storage
      const { error } = await supabase.storage
        .from('creator_files')
        .remove([path]);

      if (error) throw error;

      // Remove from the UI
      setFiles(files.filter(file => file.name !== fileName));
      
      toast({
        title: "File deleted",
        description: "The file has been successfully deleted",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error deleting file",
        description: "There was a problem deleting the file",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-primary-foreground"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-red-500">Error</h1>
        <p className="mb-4">{error}</p>
        {isSharedFilesPage && (
          <Button onClick={() => loadSharedFiles()} variant="outline">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            {isSharedFilesPage ? "Your Shared Files" : "Shared Files"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSharedFilesPage
              ? "Manage all your shared files in one place"
              : `Files shared by ${sharedFolder?.creator_id}`}
          </p>
        </div>
        
        {isSharedFilesPage && (
          <Button onClick={() => loadSharedFiles()} variant="outline" size="sm">
            Refresh
          </Button>
        )}
      </div>
      
      {isSharedFilesPage && userId && (
        <div className="mb-8">
          <FileUploader creatorId={userId} folderPath="shared" />
        </div>
      )}
      
      {!isSharedFilesPage && sharedFolder?.allow_uploads && (
        <div className="mb-8">
          <FileUploader 
            creatorId={sharedFolder.creator_id} 
            folderPath={sharedFolder.folder_path} 
          />
        </div>
      )}
      
      {files.length > 0 ? (
        <div className="grid gap-4">
          <div className="bg-secondary/10 rounded-lg p-4 mb-4">
            <div className="text-sm font-medium text-muted-foreground flex justify-between px-4 py-2">
              <span className="w-1/2">File Name</span>
              <span className="w-1/5 text-center">Size</span>
              <span className="w-1/5 text-center">Actions</span>
            </div>
          </div>
          
          {files.map((file) => (
            <div 
              key={file.name} 
              className="bg-secondary/5 border border-border/40 rounded-lg p-3 hover:bg-secondary/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-1/2">
                  <File className="h-5 w-5 text-primary" />
                  <span className="font-medium truncate">{file.name}</span>
                </div>
                <span className="w-1/5 text-center text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <div className="w-1/5 flex justify-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    asChild
                    className="h-8 w-8"
                  >
                    <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  
                  {(isSharedFilesPage || (sharedFolder?.allow_deletes)) && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                      onClick={() => handleDeleteFile(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-secondary/5 border border-dashed border-border rounded-lg p-12 text-center">
          <FileUp className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No files found</h3>
          <p className="text-muted-foreground mb-4">
            {isSharedFilesPage 
              ? "You haven't shared any files yet" 
              : "There are no files in this shared folder"}
          </p>
          {isSharedFilesPage && (
            <p className="text-sm text-muted-foreground">
              Use the uploader above to share your first file
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedFiles;
