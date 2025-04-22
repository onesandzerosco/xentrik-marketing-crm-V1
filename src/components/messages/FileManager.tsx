
import React, { useState, useEffect } from 'react';
import { File, Folder, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import FileUploader from './FileUploader';

interface FileManagerProps {
  creatorId: string;
  currentPath?: string;
  allowDelete?: boolean;
}

interface FileObject {
  name: string;
  isFolder: boolean;
  path: string;
}

const FileManager: React.FC<FileManagerProps> = ({ 
  creatorId, 
  currentPath = '', 
  allowDelete = true 
}) => {
  const [files, setFiles] = React.useState<FileObject[]>([]);
  const [currentFolder, setCurrentFolder] = useState(currentPath);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const path = `${creatorId}${currentFolder ? '/' + currentFolder : ''}`;
      
      const { data, error } = await supabase.storage
        .from('creator_files')
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) throw error;

      const processedFiles = data.map(item => ({
        name: item.name,
        isFolder: !item.metadata,
        path: `${path}/${item.name}`
      }));

      setFiles(processedFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [creatorId, currentFolder]);

  const handleDelete = async (path: string) => {
    try {
      const { error } = await supabase.storage
        .from('creator_files')
        .remove([path]);

      if (error) throw error;
      
      await loadFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const navigateToFolder = (folderPath: string) => {
    setCurrentFolder(folderPath);
  };

  const navigateUp = () => {
    const parentFolder = currentFolder.split('/').slice(0, -1).join('/');
    setCurrentFolder(parentFolder);
  };

  const renderFile = (file: FileObject) => (
    <div 
      key={file.path}
      className="flex items-center justify-between p-2 hover:bg-accent/5 rounded-lg"
    >
      <div 
        className="flex items-center gap-2 flex-1 cursor-pointer"
        onClick={() => file.isFolder && navigateToFolder(file.path)}
      >
        {file.isFolder ? (
          <Folder className="h-4 w-4 text-blue-500" />
        ) : (
          <File className="h-4 w-4 text-gray-500" />
        )}
        <span className="text-sm truncate">{file.name}</span>
      </div>
      
      {allowDelete && !file.isFolder && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(file.path)}
          className="text-destructive hover:text-destructive/90"
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Files</h3>
        {currentFolder && (
          <Button variant="outline" size="sm" onClick={navigateUp}>
            Back
          </Button>
        )}
      </div>

      <FileUploader 
        creatorId={creatorId} 
        folderPath={currentFolder}
        onUploadComplete={loadFiles}
      />

      <div className="border rounded-lg divide-y">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading...
          </div>
        ) : files.length > 0 ? (
          files.map(file => renderFile(file))
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            No files found in this folder
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
