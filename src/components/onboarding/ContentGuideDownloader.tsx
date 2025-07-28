
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const ContentGuideDownloader: React.FC = () => {
  const isMobile = useIsMobile();

  const handleDownload = () => {
    // Create a link to the PDF file and trigger download
    const link = document.createElement('a');
    link.href = '/lovable-uploads/983659fc-5fdc-41ec-b019-cd6578bbbb3e.png'; // This should be updated to the actual PDF path
    link.download = 'content-guide.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      size={isMobile ? "sm" : "default"}
      className="flex items-center"
    >
      <Download className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isMobile ? '' : 'mr-1'}`} />
      {!isMobile && 'Content Guide'}
    </Button>
  );
};
