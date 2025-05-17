
import React, { ReactNode } from 'react';
import { FileExplorerProvider } from '../context/FileExplorerContext';
import { FileExplorerContextValue } from '../types';

interface ContextProviderWrapperProps {
  contextValue: FileExplorerContextValue;
  children: ReactNode;
}

export const ContextProviderWrapper: React.FC<ContextProviderWrapperProps> = ({ 
  contextValue, 
  children 
}) => {
  return (
    <FileExplorerProvider value={contextValue}>
      {children}
    </FileExplorerProvider>
  );
};
