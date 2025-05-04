
import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Type definition for files to download
interface FileToDownload {
  id: string;
  name: string;
  url: string;
}

export const FileDownloader: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [totalFiles, setTotalFiles] = useState(0);
  const [processedFiles, setProcessedFiles] = useState(0);

  useEffect(() => {
    // Listen for download requests from other components
    const handleDownloadRequest = async (event: Event) => {
      const customEvent = event as CustomEvent<{ files: FileToDownload[] }>;
      const filesToDownload = customEvent.detail?.files;
      
      if (!filesToDownload || filesToDownload.length === 0) return;
      
      // Single file download
      if (filesToDownload.length === 1) {
        const file = filesToDownload[0];
        
        try {
          // Download the file directly
          const response = await fetch(file.url);
          const blob = await response.blob();
          saveAs(blob, file.name);
        } catch (error) {
          console.error('Error downloading file:', error);
          toast({
            variant: 'destructive',
            title: 'Download failed',
            description: 'Failed to download the file. Please try again.',
          });
        }
        return;
      }
      
      // Multiple files download (create zip)
      setIsDownloading(true);
      setProgress(0);
      setTotalFiles(filesToDownload.length);
      setProcessedFiles(0);
      
      try {
        const zip = new JSZip();
        let processedCount = 0;
        
        for (const file of filesToDownload) {
          setCurrentFile(file.name);
          
          try {
            const response = await fetch(file.url);
            const blob = await response.blob();
            zip.file(file.name, blob);
            
            processedCount++;
            setProcessedFiles(processedCount);
            setProgress(Math.round((processedCount / filesToDownload.length) * 100));
          } catch (error) {
            console.error(`Error adding ${file.name} to zip:`, error);
            // Continue with other files
          }
        }
        
        // Generate the zip file
        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: "DEFLATE",
          compressionOptions: {
            level: 6
          }
        }, (metadata) => {
          setProgress(Math.round(metadata.percent));
        });
        
        // Save the zip file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        saveAs(zipBlob, `files_${timestamp}.zip`);
        
        toast({
          title: 'Download complete',
          description: `${filesToDownload.length} files have been downloaded.`,
        });
      } catch (error) {
        console.error('Error creating zip file:', error);
        toast({
          variant: 'destructive',
          title: 'Download failed',
          description: 'Failed to create download package. Please try again.',
        });
      } finally {
        setIsDownloading(false);
      }
    };
    
    window.addEventListener('fileDownloadRequest', handleDownloadRequest);
    
    return () => {
      window.removeEventListener('fileDownloadRequest', handleDownloadRequest);
    };
  }, []);

  return (
    <Dialog open={isDownloading}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h3 className="text-lg font-medium">
              Preparing your download
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-center">
              {processedFiles} of {totalFiles} files processed
            </div>
            <Progress value={progress} />
            <div className="text-xs text-center text-muted-foreground truncate">
              {currentFile}
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Please don't close this window until the download finishes
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
