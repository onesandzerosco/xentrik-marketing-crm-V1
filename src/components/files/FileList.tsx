
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

interface FileListProps {
  files: FileItem[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
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
    <div className="divide-y divide-border">
      <div className="grid grid-cols-[1fr_120px_150px] gap-4 px-4 py-2 font-medium text-sm text-muted-foreground bg-accent/5">
        <div>Name</div>
        <div>Size</div>
        <div>Modified</div>
      </div>
      {files.map((file) => (
        <div
          key={file.name}
          className="grid grid-cols-[1fr_120px_150px] gap-4 px-4 py-3 hover:bg-accent/5 transition-colors items-center"
        >
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(file.type)}
            <span className="truncate">{file.name}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatDate(file.created_at)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
            >
              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
