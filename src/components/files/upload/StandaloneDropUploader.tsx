
import React, { useCallback, useState } from 'react';
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
  availableCategories
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const { toast } = useToast();

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
    
    // If there are ZIP files, enforce category selection
    if (hasZipFiles && !selectedCategoryId) {
      toast({
        title: "Category Required",
        description: "Please select a category for ZIP files before uploading.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a synthetic event object with the files
    const syntheticEvent = {
      target: { files: acceptedFiles },
      zipCategoryId: selectedCategoryId
    } as unknown as React.ChangeEvent<HTMLInputElement> & { zipCategoryId?: string | null };
    
    handleFileChange(syntheticEvent);
  }, [handleFileChange, selectedCategoryId, toast]);

  const handleComplete = () => {
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    try {
      // Here you would typically call your category creation API
      // For now, we'll create a temporary category object
      const newCategory: Category = {
        id: `temp-${Date.now()}`,
        name: newCategoryName
      };
      
      // Add to available categories (this would be handled by the parent component in real implementation)
      availableCategories.push(newCategory);
      setSelectedCategoryId(newCategory.id);
      
      toast({
        title: "Category Created",
        description: `Category "${newCategoryName}" has been created.`
      });
      
      setNewCategoryName('');
      setIsCreateCategoryModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Category selection for ZIP files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <CategorySelector 
            categories={availableCategories} 
            selectedCategoryId={selectedCategoryId} 
            onCategoryChange={setSelectedCategoryId} 
            label="Select category for ZIP files (required):"
          />
          
          {availableCategories.length === 0 && (
            <Button 
              onClick={() => setIsCreateCategoryModalOpen(true)}
              variant="outline"
              size="sm"
            >
              Create New Category
            </Button>
          )}
        </div>
        
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

      {/* Drop zone area */}
      <DropZone 
        onDrop={handleDrop}
        disabled={isUploading} 
        maxSize={MAX_FILE_SIZE_GB * 1024 * 1024 * 1024}
      />

      {/* Progress display */}
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
