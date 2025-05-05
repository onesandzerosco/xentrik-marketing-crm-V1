
import { useState } from 'react';

export const useUploadModal = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return {
    isUploadModalOpen,
    setIsUploadModalOpen
  };
};
