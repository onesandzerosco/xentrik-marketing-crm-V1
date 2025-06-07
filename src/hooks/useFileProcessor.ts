
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadFileToStorage } from "@/utils/storageHelpers";
import { generateVideoThumbnail, isVideoFile, getUniqueFileName } from "@/utils/fileUtils";

export const useFileProcessor = () => {
  const { toast } = useToast();

  const processRegularFile = async (
    file: File,
    creatorId: string,
    currentFolder: string,
    onComplete: (fileName: string) => void,
    onStatusUpdate: (fileName: string, status: 'uploading' | 'processing' | 'complete' | 'error', error?: string) => void
  ): Promise<string | null> => {
    try {
      console.log(`Starting to process regular file: ${file.name}`);
      
      onStatusUpdate(file.name, 'uploading');
      
      // Generate unique filename if needed
      const uniqueFileName = await getUniqueFileName(
        file.name,
        currentFolder,
        creatorId,
        'raw_uploads',
        supabase
      );
      
      // Generate thumbnail for video files
      let thumbnailUrl: string | undefined;
      if (isVideoFile(file.name)) {
        try {
          onStatusUpdate(file.name, 'processing');
          thumbnailUrl = await generateVideoThumbnail(file);
          console.log(`Generated thumbnail for video: ${file.name}`);
        } catch (error) {
          console.warn(`Failed to generate thumbnail for ${file.name}:`, error);
        }
      }
      
      onStatusUpdate(file.name, 'uploading');
      
      // Upload file using our storage helper
      const uploadResult = await uploadFileToStorage(file, creatorId, uniqueFileName);
      
      // Update the media record with additional metadata if needed
      const updateData: any = {};
      
      if (thumbnailUrl) {
        updateData.thumbnail_url = thumbnailUrl;
      }
      
      if (currentFolder !== 'all') {
        updateData.folders = [currentFolder];
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('media')
          .update(updateData)
          .eq('id', uploadResult.fileId);
          
        if (updateError) {
          console.error('Error updating file metadata:', updateError);
        }
      }
      
      onStatusUpdate(file.name, 'complete');
      onComplete(file.name);
      
      console.log(`Successfully processed file: ${file.name} with ID: ${uploadResult.fileId}`);
      return uploadResult.fileId;
      
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      onStatusUpdate(file.name, 'error', error instanceof Error ? error.message : 'Unknown error');
      
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
      
      return null;
    }
  };

  return { processRegularFile };
};
