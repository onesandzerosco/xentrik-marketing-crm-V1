
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
    const size = large ? "h-16 w-16" : "h-10 w-10";
    
    switch (type) {
      case 'image':
        return <Image className={`${size} text-purple-500`} />;
      case 'document':
        return <FileText className={`${size} text-amber-500`} />;
      case 'video':
        return <Video className={`${size} text-blue-500`} />;
      case 'audio':
        return <AudioLines className={`${size} text-green-500`} />;
      default:
        return <File className={`${size} text-gray-500`} />;
    }
  };

  const renderPreview = (file: CreatorFileType) => {
    if (file.type === 'image' && file.url) {
      return (
        <div className="relative w-full h-32 flex items-center justify-center mb-2 overflow-hidden rounded-md">
          <img 
            src={file.url} 
            alt={file.name} 
            className="object-cover w-full h-full hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => {
              // Fallback to icon on image load error
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.appendChild(
                document.createElement('div')
              ).innerHTML = getFileIcon(file.type, true).props.className;
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center w-full h-32 mb-2 bg-accent/5 rounded-md">
        {getFileIcon(file.type, true)}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex flex-col p-3 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer border border-transparent hover:border-accent/20"
        >
          {renderPreview(file)}
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium truncate w-full">
              {file.name}
            </span>
            <div className="flex justify-between w-full text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <span>{formatDate(file.created_at)}</span>
            </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-accent/10 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="w-full flex items-center justify-center gap-1.5 hover:bg-accent/20"
            >
              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
