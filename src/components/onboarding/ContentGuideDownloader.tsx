
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export const ContentGuideDownloader: React.FC = () => {
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
      className="flex items-center"
    >
      <Download className="mr-1 h-4 w-4" />
      Download Content Guide
    </Button>
  );
};
