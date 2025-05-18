
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useFileDelete = (creatorId: string, onRefresh: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // File deletion handler
  const handleFileDeleted = async (fileId: string): Promise<void> => {
    try {
      // Get the file from the database
      const { data: file, error: fetchError } = await supabase
        .from('media')
        .select('*')
        .eq('id', fileId)
        .single();
      
      if (fetchError) {
        throw new Error(`Failed to fetch file: ${fetchError.message}`);
      }
      
      // Delete the file from Supabase storage
      if (file?.bucket_key) {
        const { error: storageError } = await supabase.storage
          .from('media')
          .remove([file.bucket_key]);
        
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          toast({
            title: 'Error Deleting File',
            description: 'Failed to delete file from storage. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Delete the file record from the database
      const { error: deleteError } = await supabase
        .from('media')
        .delete()
        .eq('id', fileId);
      
      if (deleteError) {
        throw new Error(`Failed to delete file from database: ${deleteError.message}`);
      }
      
      // Optimistically update the cache
      queryClient.setQueryData(['creator-files', creatorId], (old: any) => {
        if (!old) return old;
        
        const updatedFiles = old.filter((file: any) => file.id !== fileId);
        return updatedFiles;
      });
      
      toast({
        title: 'File Deleted',
        description: 'File deleted successfully.',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error Deleting File',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return { handleFileDeleted };
};
