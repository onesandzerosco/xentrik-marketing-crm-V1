
import { useState } from 'react';

export const useUploadModal = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Decreasing width and maintaining large height for better visibility with less horizontal space
  const modalDimensions = {
    width: '500px',
    maxHeight: '90vh'
  };

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    modalDimensions
  };
};
