
import React, { useState, ChangeEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { getUniqueFileName } from '@/utils/fileUtils';

interface FileUploaderProps {
  id: string;
  creatorId: string;
  onUploadComplete?: (uploadedFileIds?: string[]) => void;
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

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadedFiles = [];
      const uploadedFileIds = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        // Create a unique file name using the utility function
        const uniqueSafeName = await getUniqueFileName(
          safeName, 
          folder, 
          creatorId, 
          bucket,
          supabase
        );
        
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
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              bucket_key: filePath,
              filename: uniqueSafeName,
              mime: file.type,
              file_size: file.size
            })
            .select('id');
            
          if (mediaError) {
            console.error('Media record creation error:', mediaError);
            // Continue uploading other files even if this record fails
          } else if (mediaData && mediaData[0]) {
            uploadedFileIds.push(mediaData[0].id);
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
      
      // Call the callback if it exists, passing the IDs of newly uploaded files
      if (onUploadComplete) {
        onUploadComplete(uploadedFileIds.length > 0 ? uploadedFileIds : undefined);
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
