
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UploadingFile } from '@/types/uploadTypes';

interface UploadingFilesListProps {
  files: UploadingFile[];
}

const UploadingFilesList: React.FC<UploadingFilesListProps> = ({ files }) => {
  if (files.length === 0) return null;

  return (
    <ScrollArea className="max-h-40 overflow-y-auto">
      <div className="space-y-3">
        {files.map((item) => (
          <div key={item.file.name} className="text-sm">
            <div className="flex justify-between mb-1">
              <span className="truncate max-w-[250px]" title={item.file.name}>
                {item.file.name}
              </span>
              <span>{Math.round(item.progress)}%</span>
            </div>
            <Progress value={item.progress} className="h-1.5" />
            {item.status === 'processing' && (
              <p className="text-xs text-amber-500 mt-1">Processing ZIP file...</p>
            )}
            {item.error && (
              <p className="text-xs text-destructive mt-1">{item.error}</p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default UploadingFilesList;
