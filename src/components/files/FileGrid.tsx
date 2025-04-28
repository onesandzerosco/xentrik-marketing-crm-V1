
import React from 'react';
import { File } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from '@/utils/fileUtils';

interface FileItem {
  name: string;
  size: number;
  created_at: string;
  url: string;
  type: string;
}

interface FileGridProps {
  files: FileItem[];
}

export const FileGrid: React.FC<FileGridProps> = ({ files }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <File className="h-10 w-10 text-purple-500" />;
      case 'document':
        return <File className="h-10 w-10 text-amber-500" />;
      default:
        return <File className="h-10 w-10 text-blue-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {files.map((file) => (
        <div
          key={file.name}
          className="group flex flex-col items-center p-4 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
        >
          <div className="relative w-full h-32 flex items-center justify-center mb-2">
            {getFileIcon(file.type)}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button 
                variant="secondary" 
                size="sm" 
                asChild
                className="shadow-md"
              >
                <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          </div>
          <span className="text-sm font-medium text-center truncate w-full">
            {file.name}
          </span>
          <div className="flex justify-between w-full mt-1 text-xs text-muted-foreground">
            <span>{formatFileSize(file.size)}</span>
            <span>{formatDate(file.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
