
import React from 'react';
import { FileExplorerHeader } from '../FileExplorerHeader';
import { FileExplorerSidebar } from '../FileExplorerSidebar';
import { FileExplorerContent } from '../FileExplorerContent';
import { useFileExplorerContext } from '../context/FileExplorerContext';
import { FileTag } from '@/hooks/useFileTags';
import { useIsMobile } from '@/hooks/use-mobile';

interface FileExplorerLayoutProps {
  children: React.ReactNode;
}

export const FileExplorerLayout: React.FC<FileExplorerLayoutProps> = ({
  children
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex h-full ${isMobile ? 'flex-col' : ''}`}>
      {children}
    </div>
  );
};
