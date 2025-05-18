
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = (
  creatorId: string, 
  currentFolder: string, 
  currentCategory: string | null, 
  onUploadStart: () => void, 
  onUploadComplete: (uploadedFileIds?: string[]) => void
) => {
  const { toast } = useToast();
  
  // File upload handlers
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      onUploadStart();
      
      const uploadedFileIds: string[] = [];
      
      for (const file of acceptedFiles) {
        try {
          // Generate a unique file name
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `${creatorId}/${fileName}`;
          
          // Upload the file to Supabase storage
          const { data, error } = await supabase.storage
            .from('media')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });
          
          if (error) {
            console.error('Error uploading file:', error);
            toast({
              title: 'Upload Failed',
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: 'destructive',
            });
            continue;
          }
          
          // Get the public URL for the uploaded file
          const { data: urlData } = supabase.storage
            .from('media')
            .getPublicUrl(data.path);
          
          // Create a new media record in the database
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .insert({
              creator_id: creatorId,
              file_size: file.size,
              filename: file.name,
              mime: file.type,
              bucket_key: data.path,
              folders: currentFolder !== 'all' ? [currentFolder] : [],
              categories: currentCategory ? [currentCategory] : [],
              status: 'available',
              tags: []  // Initialize with empty tags array
            })
            .select()
            .single();
          
          if (mediaError) {
            console.error('Error creating media record:', mediaError);
            toast({
              title: 'Upload Failed',
              description: `Failed to create record for ${file.name}. Please try again.`,
              variant: 'destructive',
            });
            continue;
          }
          
          uploadedFileIds.push(mediaData.id);
          
          toast({
            title: 'Upload Complete',
            description: `${file.name} uploaded successfully.`,
          });
        } catch (err: any) {
          console.error('Unexpected error during upload:', err);
          toast({
            title: 'Upload Error',
            description: `An unexpected error occurred during the upload of ${file.name}.`,
            variant: 'destructive',
          });
        }
      }
      
      onUploadComplete(uploadedFileIds);
    },
    [creatorId, currentFolder, currentCategory, onUploadComplete, onUploadStart, toast]
  );
  
  return { onDrop };
};
