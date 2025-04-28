
import React from 'react';
import { FileText, Image, File, Video, AudioLines, Download, Share2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { CreatorFileType } from '@/pages/CreatorFiles';
import { useToast } from "@/components/ui/use-toast";

interface FileListProps {
  files: CreatorFileType[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const { toast } = useToast();
  const totalFiles = files.length;
  const uploadingFiles = files.filter(file => file.status === 'uploading').length;

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <AudioLines className="h-4 w-4 text-green-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleShare = (file: CreatorFileType) => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="text-sm text-muted-foreground">
          {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
          {uploadingFiles > 0 && (
            <span className="ml-2 text-primary">
              ({uploadingFiles} uploading)
            </span>
          )}
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_150px_120px] gap-3 px-4 py-3 font-medium text-xs border-b bg-muted/20">
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div className="text-right">Actions</div>
        </div>
        <div className="divide-y">
          {files.map((file) => (
            <div
              key={file.id}
              className="grid grid-cols-[1fr_100px_150px_120px] gap-3 px-4 py-3 hover:bg-muted/10 transition-colors items-center"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {getFileIcon(file.type)}
                <span className="truncate">{file.name}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(file.created_at)}
              </div>
              <div className="flex justify-end gap-2">
                {file.status === 'uploading' ? (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled
                    className="h-7 px-2"
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="h-7 px-2"
                    >
                      <a 
                        href={file.url} 
                        download={file.name} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Download ${file.name}`}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(file)}
                      className="h-7 px-2"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
