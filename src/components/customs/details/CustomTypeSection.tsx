
import React from 'react';
import { Custom } from '@/types/custom';

interface CustomTypeSectionProps {
  custom: Custom;
}

const CustomTypeSection: React.FC<CustomTypeSectionProps> = ({ custom }) => {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">Custom Type</label>
      <p className="text-white bg-secondary/20 p-3 rounded mt-1">
        {custom.custom_type || 'Not specified'}
      </p>
    </div>
  );
};

export default CustomTypeSection;
