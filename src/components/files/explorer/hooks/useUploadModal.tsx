
import { useState } from 'react';

export const useUploadModal = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Setting standard modal dimensions for consistency
  const modalDimensions = {
    width: '500px',
    maxHeight: '85vh'
  };

  return {
    isUploadModalOpen,
    setIsUploadModalOpen,
    modalDimensions
  };
};
