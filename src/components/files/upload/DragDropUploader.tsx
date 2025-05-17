
import React from 'react';
import { StandaloneDropUploader } from './StandaloneDropUploader';
import { Category } from '@/types/fileTypes';

interface DragDropUploaderProps {
  creatorId: string;
  onUploadComplete?: (fileIds?: string[]) => void;
  onCancel: () => void;
  currentFolder: string;  
  availableCategories: Category[];
}

const DragDropUploader: React.FC<DragDropUploaderProps> = (props) => {
  return (
    <StandaloneDropUploader {...props} />
  );
};

export default DragDropUploader;
