
import React from 'react';

interface ExplorerActionsWrapperProps {
  explorerState: any;
  onUploadStart?: () => void;
}

export const ExplorerActionsWrapper: React.FC<ExplorerActionsWrapperProps> = ({
  explorerState,
  onUploadStart
}) => {
  // Handle file upload button click
  const handleUploadClick = () => {
    if (onUploadStart) {
      onUploadStart();
    }
    explorerState.setIsUploadModalOpen(true);
  };

  // Return the functions wrapped in a context object
  // This component doesn't render anything visual
  return {
    handleUploadClick
  } as unknown as React.ReactElement;
};
