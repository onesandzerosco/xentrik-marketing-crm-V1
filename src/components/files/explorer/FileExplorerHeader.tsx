
import React from 'react';
import { FileHeader } from '../FileHeader';

interface FileExplorerHeaderProps {
  creatorName: string;
  onUploadClick: () => void;
  isCreatorView: boolean;
}

export const FileExplorerHeader: React.FC<FileExplorerHeaderProps> = ({
  creatorName,
  onUploadClick,
  isCreatorView
}) => {
  return (
    <FileHeader 
      creatorName={creatorName}
      onUploadClick={onUploadClick}
      isCreatorView={isCreatorView}
    />
  );
};
