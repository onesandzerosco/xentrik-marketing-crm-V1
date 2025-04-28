
import React from 'react';
import { FileText, Image, File, Video, AudioLines, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';

interface FileGridProps {
  files: CreatorFileType[];
}

export const FileGrid: React.FC<FileGridProps> = ({ files }) => {
  const getFileIcon = (type: string, large = false) => {
    const size = large ? "h-12 w-12" : "h-5 w-5";
    
    switch (type) {
      case 'image':
        return <Image className={`${size} text-blue-500`} />;
      case 'document':
        return <FileText className={`${size} text-orange-500`} />;
      case 'video':
        return <Video className={`${size} text-red-500`} />;
      case 'audio':
        return <AudioLines className={`${size} text-green-500`} />;
      default:
        return <File className={`${size} text-gray-500`} />;
    }
  };

  const renderPreview = (file: CreatorFileType) => {
    if (file.type === 'image' && file.url) {
      return (
        <div className="aspect-square bg-accent/10 flex items-center justify-center overflow-hidden rounded-md">
          <img 
            src={file.url} 
            alt={file.name} 
            className="object-cover w-full h-full"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<div class="flex items-center justify-center w-full h-full">${getFileIcon(file.type, true)}</div>`;
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="aspect-square bg-accent/5 flex items-center justify-center rounded-md">
        {getFileIcon(file.type, true)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
        >
          {renderPreview(file)}
          
          <div className="p-2">
            <div className="text-sm font-medium truncate mb-1">
              {file.name}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <span>{formatDate(file.created_at)}</span>
            </div>
          </div>
          
          <div className="px-2 pb-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="w-full"
            >
              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                <Download className="h-3 w-3 mr-1" />
                <span>Download</span>
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
