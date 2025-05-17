
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

  return {
    handleUploadClick
  };
};
