
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadFile } from '@/utils/storageHelpers';

interface FileDownloaderProps {
  bucketPath: string;
  fileName: string;
  disabled?: boolean;
}

const FileDownloader: React.FC<FileDownloaderProps> = ({ 
  bucketPath, 
  fileName, 
  disabled = false 
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!bucketPath || !fileName) {
      toast({
        title: "Download failed",
        description: "File information is missing",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDownloading(true);
      await downloadFile(bucketPath, fileName);
      
      toast({
        title: "Download started",
        description: `Downloading ${fileName}...`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download file",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download"}
    </Button>
  );
};

export default FileDownloader;
