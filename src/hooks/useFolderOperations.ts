
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from '@/types/fileTypes';
import { useToast } from '@/components/ui/use-toast';

interface UseFolderOperationsProps {
  creatorId?: string;
}

export const useFolderOperations = ({ creatorId }: UseFolderOperationsProps) => {
  const { toast } = useToast();
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([
    { id: 'all', name: 'All Files' },
    { id: 'unsorted', name: 'Unsorted Uploads' }
  ]);

  // Updated to use a more reliable approach for loading folders
  const loadCustomFolders = async () => {
    if (!creatorId) return;
    
    try {
      // First try to get custom folders from the database
      const { data: folderData, error: folderError } = await supabase
        .from('media')
        .select('folders')
        .filter('creator_id', 'eq', creatorId);
      
      if (folderError) {
        console.error("Error loading folders from media table:", folderError);
        // Fall back to listing storage directories
        loadFoldersFromStorage();
        return;
      }
      
      // Extract unique folder IDs from all files
      const uniqueFolders = new Set<string>();
      folderData?.forEach(item => {
        if (item.folders && Array.isArray(item.folders)) {
          item.folders.forEach(folder => {
            if (folder !== 'all' && folder !== 'unsorted') {
              uniqueFolders.add(folder);
            }
          });
        }
      });
      
      // Convert folder IDs to folder objects with proper naming
      const customFolders = Array.from(uniqueFolders).map(folderId => ({
        id: folderId,
        name: folderId.charAt(0).toUpperCase() + folderId.slice(1).replace(/-/g, ' ')
      }));
      
      // Set the available folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
      // If no folders found in the database, try to list from storage as fallback
      if (customFolders.length === 0) {
        loadFoldersFromStorage();
      }
      
    } catch (err) {
      console.error("Error in loadCustomFolders:", err);
      // Fall back to listing storage directories
      loadFoldersFromStorage();
    }
  };
  
  // Fallback method to load folders from storage
  const loadFoldersFromStorage = async () => {
    if (!creatorId) return;
    
    try {
      // Try to list all directories in the creator's storage
      const { data: folders, error } = await supabase.storage
        .from('creator_files')
        .list(creatorId, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        console.error("Error loading folders from storage:", error);
        return;
      }
      
      // Filter to only include directories (not files)
      const customFolders = folders
        ?.filter(item => item.id && item.id !== '.' && item.id !== '..')
        ?.filter(item => !item.name.includes('.')) // Simple check to exclude files
        ?.filter(item => item.name !== 'all' && item.name !== 'unsorted')
        ?.map(folder => ({
          id: folder.name,
          name: folder.name.charAt(0).toUpperCase() + folder.name.slice(1).replace(/-/g, ' ') // Capitalize and format
        })) || [];
      
      // Add the custom folders to the available folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
    } catch (err) {
      console.error("Error in loadFoldersFromStorage:", err);
    }
  };

  useEffect(() => {
    if (creatorId) {
      loadCustomFolders();
    }
  }, [creatorId]);

  return {
    availableFolders,
    setAvailableFolders,
    loadCustomFolders
  };
};
