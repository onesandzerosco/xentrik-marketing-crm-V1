
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreatorFileType } from '@/types/fileTypes';
import JSZip from 'jszip';

interface UseBatchFileOperationsProps {
  onFilesChanged: () => void;
  onFileDeleted?: (fileId: string) => void;
}

export const useBatchFileOperations = ({
  onFilesChanged,
  onFileDeleted
}: UseBatchFileOperationsProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const downloadSelectedFiles = async (files: CreatorFileType[], selectedFileIds: string[]) => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to download",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const selectedFiles = files.filter(file => selectedFileIds.includes(file.id));
      
      if (selectedFiles.length === 1) {
        // Single file download
        const file = selectedFiles[0];
        const { data, error } = await supabase.storage
          .from('raw_uploads')
          .download(file.bucketPath || '');
        
        if (error) throw error;
        
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Multiple files - create ZIP
        const zip = new JSZip();
        
        for (const file of selectedFiles) {
          try {
            const { data, error } = await supabase.storage
              .from('raw_uploads')
              .download(file.bucketPath || '');
            
            if (!error && data) {
              zip.file(file.name, data);
            }
          } catch (error) {
            console.error(`Error downloading file ${file.name}:`, error);
          }
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected_files_${new Date().getTime()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Download started",
        description: `Downloading ${selectedFiles.length} file(s)`
      });
    } catch (error) {
      console.error("Error downloading files:", error);
      toast({
        title: "Download failed",
        description: "Failed to download selected files",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSelectedFiles = async (files: CreatorFileType[], selectedFileIds: string[]) => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to delete",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const selectedFiles = files.filter(file => selectedFileIds.includes(file.id));
      
      // Delete files from storage and database
      for (const file of selectedFiles) {
        // Delete from storage
        if (file.bucketPath) {
          await supabase.storage
            .from('raw_uploads')
            .remove([file.bucketPath]);
        }
        
        // Delete from database
        await supabase
          .from('media')
          .delete()
          .eq('id', file.id);
        
        // Notify parent component
        if (onFileDeleted) {
          onFileDeleted(file.id);
        }
      }
      
      onFilesChanged();
      
      toast({
        title: "Files deleted",
        description: `Successfully deleted ${selectedFiles.length} file(s)`
      });
    } catch (error) {
      console.error("Error deleting files:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete selected files",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    downloadSelectedFiles,
    deleteSelectedFiles,
    isProcessing
  };
};
