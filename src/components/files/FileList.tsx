
import React from 'react';
import { FileText, Image, File, Video, AudioLines, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';

interface FileListProps {
  files: CreatorFileType[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-amber-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'audio':
        return <AudioLines className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="divide-y divide-border">
      <div className="grid grid-cols-[1fr_120px_150px_80px] gap-4 px-4 py-2 font-medium text-xs text-muted-foreground bg-accent/5">
        <div>Name</div>
        <div className="hidden sm:block">Size</div>
        <div className="hidden sm:block">Modified</div>
        <div className="text-right">Action</div>
      </div>
      {files.map((file) => (
        <div
          key={file.id}
          className="grid grid-cols-[1fr_120px_150px_80px] gap-4 px-4 py-3 hover:bg-accent/5 transition-colors items-center"
        >
          <div className="flex items-center gap-3 min-w-0">
            {getFileIcon(file.type)}
            <span className="truncate">{file.name}</span>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {formatFileSize(file.size)}
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {formatDate(file.created_at)}
          </div>
          <div className="flex justify-end">
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="flex items-center gap-1 hover:bg-accent/10"
            >
              <a 
                href={file.url} 
                download={file.name} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label={`Download ${file.name}`}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
