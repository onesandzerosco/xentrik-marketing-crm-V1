
import React from 'react';
import { formatFileSize, formatDate } from '@/utils/fileUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Download, Trash2, FileText, Edit } from 'lucide-react';
import { FileDownloader } from './FileDownloader';
import { CreatorFileType } from '@/pages/CreatorFiles';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FileListProps {
  files: (CreatorFileType & { isHighlighted?: boolean })[];
  selectedFiles: CreatorFileType[];
  onFileSelect: (file: CreatorFileType, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onEditDescription?: (file: CreatorFileType) => void;
  showDownloadAction?: boolean;
  showDeleteAction?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onSelectAll,
  onEditDescription,
  showDownloadAction = true,
  showDeleteAction = false,
}) => {
  const allSelected = files.length > 0 && files.length === selectedFiles.length;
  
  const handleRowClick = (file: CreatorFileType) => {
    if (file.type === 'video' && file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="bg-card border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                id="select-all-list"
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Date Added</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const isSelected = selectedFiles.some(f => f.id === file.id);
            
            return (
              <TableRow 
                key={file.id}
                className={`${file.isHighlighted ? 'bg-primary/5' : ''} ${
                  isSelected ? 'bg-muted' : ''
                } ${file.type === 'video' ? 'cursor-pointer' : ''}`}
                onClick={() => handleRowClick(file)}
              >
                <TableCell className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onFileSelect(file, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{file.name}</div>
                </TableCell>
                <TableCell>
                  <div className="capitalize">{file.type}</div>
                </TableCell>
                <TableCell>{formatFileSize(file.size)}</TableCell>
                <TableCell>{formatDate(file.created_at)}</TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={file.description || ''}>
                    {file.description || '-'}
                  </div>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    {showDownloadAction && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
                              <FileDownloader files={[file]}>
                                <Download className="h-4 w-4" />
                              </FileDownloader>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {showDeleteAction && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7 text-destructive"
                              onClick={() => onFileSelect(file, true)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    
                    {onEditDescription && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={() => onEditDescription(file)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Edit Description</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default FileList;
