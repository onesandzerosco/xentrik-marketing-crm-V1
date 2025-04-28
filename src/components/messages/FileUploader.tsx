
import React, { useState, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ id, creatorId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${creatorId}/shared/${safeName}`;
        
        const { error } = await supabase.storage
          .from('creator_files')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (error) {
          throw error;
        }
        
        uploadedFiles.push(file.name);
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
