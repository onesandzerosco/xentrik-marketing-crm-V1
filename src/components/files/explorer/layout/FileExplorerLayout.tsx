
import React from 'react';
import { FileExplorerHeader } from '../FileExplorerHeader';
import { FileExplorerSidebar } from '../FileExplorerSidebar';
import { FileExplorerContent } from '../FileExplorerContent';
import { useFileExplorerContext } from '../context/FileExplorerContext';
import { FileTag } from '@/hooks/useFileTags';

interface FileExplorerLayoutProps {
  children: React.ReactNode;
}

export const FileExplorerLayout: React.FC<FileExplorerLayoutProps> = ({
  children
}) => {
  return <div className="flex flex-col h-full">{children}</div>;
};
