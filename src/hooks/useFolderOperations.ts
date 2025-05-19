
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
  const [isLoading, setIsLoading] = useState(true);

  // Load custom categories and folders
  const loadCustomCategoriesAndFolders = async () => {
    if (!creatorId) return;
    
    try {
      setIsLoading(true);
      
      // First, load categories from the file_categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('file_categories')
        .select('*')
        .eq('creator', creatorId)
        .order('category_name', { ascending: true });
      
      if (categoriesError) {
        console.error("Error loading categories:", categoriesError);
        // Continue anyway to try loading folders
      } else {
        // Map the categories to the expected format
        const customCategories = categoriesData?.map(category => ({
          id: category.category_id,
          name: category.category_name
        })) || [];
        
        // Set the available categories
        setAvailableCategories(customCategories);
      }
      
      // Next, load folders from the file_folders table
      const { data: foldersData, error: foldersError } = await supabase
        .from('file_folders')
        .select('*')
        .eq('creator_id', creatorId)
        .order('folder_name', { ascending: true });
      
      if (foldersError) {
        console.error("Error loading folders:", foldersError);
        // Fall back to checking media table
        loadFoldersFromMedia();
        return;
      }
      
      // Map the folders to the expected format
      const customFolders = foldersData?.map(folder => ({
        id: folder.folder_id,
        name: folder.folder_name,
        categoryId: folder.category_id
      })) || [];
      
      // Merge with the default folders
      setAvailableFolders(prevFolders => {
        const defaultFolders = prevFolders.filter(f => f.id === 'all' || f.id === 'unsorted');
        return [...defaultFolders, ...customFolders];
      });
      
      // If no folders found in the database, check the media table for any folder references
      if (customFolders.length === 0) {
        loadFoldersFromMedia();
      }
      
    } catch (err) {
      console.error("Error in loadCustomCategoriesAndFolders:", err);
      loadFoldersFromMedia();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback method to check for folder references in the media table
  const loadFoldersFromMedia = async () => {
    if (!creatorId) return;
    
    try {
      // Get all files for this creator to check for folder references
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .select('folders')
        .eq('creator_id', creatorId);
      
      if (mediaError) {
        console.error("Error loading files:", mediaError);
        return;
      }
      
      // Extract unique folder IDs from all files
      const folderIds = new Set<string>();
      
      mediaData?.forEach(item => {
        if (item.folders && Array.isArray(item.folders)) {
          item.folders.forEach(folderId => {
            if (folderId !== 'all' && folderId !== 'unsorted') {
              folderIds.add(folderId);
            }
          });
        }
      });
      
      // If we found folder references that aren't in our database yet,
      // create placeholder folders in the uncategorized category
      if (folderIds.size > 0) {
        // Create an "Uncategorized" category if it doesn't exist
        let uncategorizedId: string;
        const existingUncategorized = availableCategories.find(cat => cat.name === "Uncategorized");
        
        if (existingUncategorized) {
          uncategorizedId = existingUncategorized.id;
        } else {
          const { data: newCategory, error: createCategoryError } = await supabase
            .from('file_categories')
            .insert({
              category_name: "Uncategorized",
              creator: creatorId
            })
            .select('category_id')
            .single();
          
          if (createCategoryError) {
            console.error("Error creating uncategorized category:", createCategoryError);
            return;
          }
          
          uncategorizedId = newCategory.category_id;
          
          // Add to available categories
          setAvailableCategories(prev => [...prev, { id: uncategorizedId, name: "Uncategorized" }]);
        }
        
        // Create placeholder folders in the database
        for (const folderId of folderIds) {
          // Check if this folder exists in the file_folders table
          const { data: existingFolder, error: checkError } = await supabase
            .from('file_folders')
            .select('folder_id')
            .eq('folder_id', folderId)
            .maybeSingle();
          
          if (checkError) {
            console.error(`Error checking folder ${folderId}:`, checkError);
            continue;
          }
          
          // If folder doesn't exist, create it
          if (!existingFolder) {
            const folderName = folderId
              .replace(/-/g, ' ')
              .replace(/\b\w/g, char => char.toUpperCase());
            
            const { error: insertError } = await supabase
              .from('file_folders')
              .insert({
                folder_id: folderId,
                folder_name: folderName,
                category_id: uncategorizedId,
                creator_id: creatorId
              });
            
            if (insertError) {
              console.error(`Error creating folder ${folderId}:`, insertError);
            } else {
              // Add to available folders
              setAvailableFolders(prev => [
                ...prev.filter(f => f.id !== folderId), // Remove if exists
                { id: folderId, name: folderName, categoryId: uncategorizedId }
              ]);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error in loadFoldersFromMedia:", err);
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
    loadCustomCategoriesAndFolders,
    isLoading
  };
};
