
import React from 'react';
import { Custom } from '@/types/custom';

interface AdditionalInfoSectionProps {
  custom: Custom;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ custom }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Sale Made By</label>
        <div className="mt-1">
          <span className="text-white">{custom.sale_by}</span>
        </div>
      </div>
      
      {custom.custom_type && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Custom Type</label>
          <div className="mt-1">
            <span className="text-white">{custom.custom_type}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalInfoSection;
