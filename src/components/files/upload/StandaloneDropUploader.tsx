
import React, { useCallback, useState, useEffect } from 'react';
import { DropZone } from './DropZone';
import { UploadActions } from './UploadActions';
import { CategorySelector } from './CategorySelector';
import FileUploadProgress from './FileUploadProgress';
import { CreateCategoryModal } from '../explorer/CreateCategoryModal';
import { Category } from '@/types/fileTypes';
import { useFileUploadHandler } from './FileUploadHandler';
import { isZipFile } from '@/utils/zipUtils';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface StandaloneDropUploaderProps {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;  
  availableCategories: Category[];
}

export const StandaloneDropUploader: React.FC<StandaloneDropUploaderProps> = ({
  creatorId,
  onUploadComplete,
  onCancel,
  currentFolder,
  availableCategories: initialCategories
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>(initialCategories);
  const { toast } = useToast();

  // Load categories when component mounts or creatorId changes - memoized to prevent infinite calls
  const loadCategories = useCallback(async () => {
    if (!creatorId) return;
    
    console.log('Loading categories for creator:', creatorId);
    
    try {
      const { data: categories, error } = await supabase
        .from('file_categories')
        .select('category_id, category_name')
        .eq('creator', creatorId);
      
      if (error) {
        console.error('Error loading categories:', error);
        return;
      }
      
      if (categories && categories.length > 0) {
        const formattedCategories: Category[] = categories.map(cat => ({
          id: cat.category_id,
          name: cat.category_name
        }));
        console.log('Loaded categories:', formattedCategories);
        setAvailableCategories(formattedCategories);
      } else {
        console.log('No categories found, using initial categories');
        setAvailableCategories(initialCategories);
      }
    } catch (error) {
      console.error('Error in loadCategories:', error);
      setAvailableCategories(initialCategories);
    }
  }, [creatorId, initialCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Get the upload handler
  const {
    isUploading,
    fileStatuses,
    overallProgress,
    handleFileChange,
    handleCancelUpload,
    MAX_FILE_SIZE_GB
  } = useFileUploadHandler({
    creatorId,
    currentFolder,
    onUploadComplete,
    availableCategories
  });

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    // Check if any files are ZIP files
    const zipFiles = acceptedFiles.filter(file => isZipFile(file.name));
    const hasZipFiles = zipFiles.length > 0;
    
    console.log('Files dropped:', acceptedFiles.map(f => f.name));
    console.log('ZIP files found:', zipFiles.map(f => f.name));
    console.log('Available categories:', availableCategories);
    console.log('Selected category ID:', selectedCategoryId);
    
    // SOP Step 1: If there are ZIP files, enforce category selection
    if (hasZipFiles && !selectedCategoryId) {
      toast({
        title: "Category Required for ZIP Files",
        description: "Please select a category for ZIP files before uploading. This is required to organize your content properly.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a synthetic event object with the files
    const syntheticEvent = {
      target: { files: acceptedFiles },
      zipCategoryId: selectedCategoryId
    } as unknown as React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string | null };
    
    console.log('Proceeding with upload, category:', selectedCategoryId);
    handleFileChange(syntheticEvent);
  }, [handleFileChange, selectedCategoryId, toast, availableCategories]);

  const handleComplete = () => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    console.log('Creating new category:', newCategoryName);
    
    try {
      // Create category in database
      const { data: newCategory, error } = await supabase
        .from('file_categories')
        .insert({
          category_name: newCategoryName,
          creator: creatorId
        })
        .select('category_id, category_name')
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        toast({
          title: "Error",
          description: "Failed to create category.",
          variant: "destructive"
        });
        return;
      }
      
      // Add to available categories
      const categoryToAdd: Category = {
        id: newCategory.category_id,
        name: newCategory.category_name
      };
      
      console.log('Category created successfully:', categoryToAdd);
      
      setAvailableCategories(prev => [...prev, categoryToAdd]);
      setSelectedCategoryId(newCategory.category_id);
      
      toast({
        title: "Category Created",
        description: `Category "${newCategoryName}" has been created and selected.`
      });
      
      setNewCategoryName('');
      setIsCreateCategoryModalOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* SOP Step 1 & 2: Category selection for ZIP files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <CategorySelector 
            categories={availableCategories} 
            selectedCategoryId={selectedCategoryId} 
            onCategoryChange={setSelectedCategoryId} 
            label="Select category for ZIP files (required for ZIP uploads):"
          />
          
          {/* Show Create New Category button when no categories available */}
          {availableCategories.length === 0 && (
            <Button 
              onClick={() => setIsCreateCategoryModalOpen(true)}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Create New Category
            </Button>
          )}
        </div>
        
        {/* Show Create New Category option when categories exist */}
        {availableCategories.length > 0 && (
          <Button 
            onClick={() => setIsCreateCategoryModalOpen(true)}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            + Create New Category
          </Button>
        )}
      </div>

      {/* SOP Step 3: Drop zone area */}
      <DropZone 
        onDrop={handleDrop}
        disabled={isUploading} 
        maxSize={MAX_FILE_SIZE_GB * 1024 * 1024 * 1024}
      />

      {/* Progress display for uploads */}
      {isUploading && fileStatuses.length > 0 && (
        <div className="border rounded-md p-4 mt-4 bg-background max-h-[250px] overflow-y-auto">
          <FileUploadProgress
            fileStatuses={fileStatuses}
            overallProgress={overallProgress}
            onClose={() => {}}
            onCancelUpload={handleCancelUpload}
            embedded={true}
          />
        </div>
      )}

      {/* Action buttons */}
      <UploadActions 
        onCancel={onCancel}
        onComplete={handleComplete}
        isUploading={isUploading}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onOpenChange={setIsCreateCategoryModalOpen}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        handleSubmit={handleCreateCategory}
        onCreate={() => setIsCreateCategoryModalOpen(false)}
      />
    </div>
  );
};
