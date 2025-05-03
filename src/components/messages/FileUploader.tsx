
import React, { useState, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: () => void;
  folder?: string;
  bucket?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  id, 
  creatorId, 
  onUploadComplete,
  folder = 'shared',
  bucket = 'creator_files'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Check if a file with the same name exists and generate a unique name
  const getUniqueFileName = async (fileName: string, folderPath: string) => {
    try {
      const baseName = fileName.substring(0, fileName.lastIndexOf('.'));
      const extension = fileName.substring(fileName.lastIndexOf('.'));
      
      let counter = 0;
      let uniqueName = fileName;
      let isUnique = false;
      
      while (!isUnique) {
        // Try to list files that match the current name
        const { data: existingFiles, error } = await supabase.storage
          .from(bucket)
          .list(`${creatorId}/${folderPath}`, {
            search: uniqueName
          });
        
        if (error) {
          console.error('Error checking for file existence:', error);
          break; // In case of error, just use the original file name
        }
        
        // Check if there's any file with the exact same name
        const exactMatch = existingFiles?.find(file => file.name === uniqueName);
        
        if (!exactMatch) {
          isUnique = true;
        } else {
          counter++;
          uniqueName = `${baseName} (${counter})${extension}`;
        }
        
        // Safety check to prevent infinite loops
        if (counter > 100) {
          uniqueName = `${baseName}_${Date.now()}${extension}`;
          isUnique = true;
        }
      }
      
      return uniqueName;
    } catch (error) {
      console.error('Error generating unique filename:', error);
      return `${Date.now()}_${fileName}`; // Fallback to timestamp
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Create a unique file name
        const uniqueSafeName = await getUniqueFileName(safeName, folder);
        const filePath = `${creatorId}/${folder}/${uniqueSafeName}`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          throw uploadError;
        }
        
        // If using the raw_uploads bucket, also insert a record in the media table
        if (bucket === 'raw_uploads') {
          const { error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueSafeName,
              mime: file.type,
              file_size: file.size
            });
            
          if (mediaError) {
            console.error('Media record creation error:', mediaError);
            // Continue uploading other files even if this record fails
          }
        }
        
        uploadedFiles.push(uniqueSafeName.replace(/_/g, ' '));
      }
      
      toast({
        title: uploadedFiles.length > 1 
          ? `${uploadedFiles.length} files uploaded` 
          : '1 file uploaded',
        description: uploadedFiles.length > 1 
          ? `Successfully uploaded ${uploadedFiles.length} files` 
          : `Successfully uploaded ${uploadedFiles[0]}`,
      });
      
      // Reset the input
      e.target.value = '';
      
      // Call the callback if it exists
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload the file(s)',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <input
      id={id}
      type="file"
      onChange={handleFileChange}
      disabled={isUploading}
      multiple
      className="hidden"
    />
  );
};

export default FileUploader;
