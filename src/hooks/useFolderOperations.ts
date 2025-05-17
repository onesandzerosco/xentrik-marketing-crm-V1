
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Folder, Category } from '@/types/fileTypes';

interface UseFolderOperationsProps {
  creatorId?: string;
}

export const useFolderOperations = ({ creatorId }: UseFolderOperationsProps) => {
  const { toast } = useToast();
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([
    { id: 'all', name: 'All Files', categoryId: 'system' },
    { id: 'unsorted', name: 'Unsorted Uploads', categoryId: 'system' }
  ]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);

  // Load custom categories and folders
  const loadCustomCategoriesAndFolders = async () => {
    if (!creatorId) return;
    
    try {
      // First, load categories from the file_categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('file_categories')
        .select('*')
        .eq('creator_id', creatorId)
        .order('name', { ascending: true });
      
      if (categoriesError) {
        console.error("Error loading categories:", categoriesError);
        // Continue anyway to try loading folders
      } else {
        // Map the categories to the expected format
        const customCategories = categoriesData?.map(category => ({
          id: category.id,
          name: category.name
        })) || [];
        
        // Set the available categories
        setAvailableCategories(customCategories);
      }
      
      // Load folders from the folders table
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('creator_id', creatorId);
      
      if (foldersError) {
        console.error("Error loading folders:", foldersError);
        // Fall back to trying to extract folders from media
        fallbackToMediaFolders();
        return;
      }
      
      if (foldersData && foldersData.length > 0) {
        // Map the folders to the expected format
        const customFolders = foldersData.map(folder => ({
          id: folder.id,
          name: folder.name,
          categoryId: folder.category_id
        }));
        
        // Merge with the default folders
        setAvailableFolders(prevFolders => {
          const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
          return [...defaultFolders, ...customFolders];
        });
      } else {
        // If no folders found in the database, try to extract from media
        fallbackToMediaFolders();
      }
      
    } catch (err) {
      console.error("Error in loadCustomCategoriesAndFolders:", err);
      fallbackToMediaFolders();
    }
  };
  
  // Fallback method to extract folders from media table
  const fallbackToMediaFolders = async () => {
    try {
      // Try to get folder information from the media table
      // This approach relies on the folders array in the media table
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('folders, categories')
        .filter('creator_id', 'eq', creatorId);
      
      if (mediaError) {
        console.error("Error loading folders from media table:", mediaError);
        // Fall back to listing storage directories
        loadFoldersFromStorage();
        return;
      }
      
      // Extract unique folder IDs and their associated categories from all files
      const folderMap = new Map<string, string>(); // Map of folderId -> categoryId
      
      mediaData?.forEach(item => {
        if (item.folders && Array.isArray(item.folders)) {
          item.folders.forEach(folderId => {
            if (folderId !== 'all' && folderId !== 'unsorted') {
              // Find a category for this folder
              const categoryId = item.categories?.find(cat => 
                availableCategories.some(c => c.id === cat)
              ) || 'uncategorized';
              
              folderMap.set(folderId, categoryId);
            }
          });
        }
      });
      
      // Convert folder map to folder objects with proper naming and category association
      const customFolders = Array.from(folderMap.entries()).map(([folderId, categoryId]) => ({
        id: folderId,
        name: folderId.charAt(0).toUpperCase() + folderId.slice(1).replace(/-/g, ' '),
        categoryId
      }));
      
      // Merge with the default folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
      // If no folders found in the database, try to list from storage as fallback
      if (customFolders.length === 0) {
        loadFoldersFromStorage();
      }
      
    } catch (err) {
      console.error("Error in fallbackToMediaFolders:", err);
      // Fall back to listing storage directories
      loadFoldersFromStorage();
    }
  };
  
  // Last resort fallback method to load folders from storage
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
          name: folder.name.charAt(0).toUpperCase() + folder.name.slice(1).replace(/-/g, ' '), // Capitalize and format
          categoryId: 'uncategorized' // Default category for folders found in storage
        })) || [];
      
      // Add the custom folders to the available folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
      // If we found folders but have no categories, create a default "uncategorized" category
      if (customFolders.length > 0 && availableCategories.length === 0) {
        setAvailableCategories([{ id: 'uncategorized', name: 'Uncategorized' }]);
      }
      
    } catch (err) {
      console.error("Error in loadFoldersFromStorage:", err);
    }
  };

  useEffect(() => {
    if (creatorId) {
      loadCustomCategoriesAndFolders();
    }
  }, [creatorId]);

  return {
    availableFolders,
    setAvailableFolders,
    availableCategories,
    setAvailableCategories,
    loadCustomCategoriesAndFolders
  };
};
