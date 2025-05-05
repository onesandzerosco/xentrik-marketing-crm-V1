
import { useState } from 'react';

export const useUploadModal = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Increasing modal dimensions for better visibility and less scrolling
  const modalDimensions = {
    width: '700px',
    maxHeight: '90vh'
  };

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    modalDimensions
  };
};
