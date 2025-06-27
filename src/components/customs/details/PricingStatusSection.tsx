
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { Custom } from '@/types/custom';

interface PricingStatusSectionProps {
  custom: Custom;
}

const PricingStatusSection: React.FC<PricingStatusSectionProps> = ({ custom }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Downpayment</label>
        <div className="flex items-center mt-1">
          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-white">{formatCurrency(custom.downpayment)}</span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-muted-foreground">Full Price</label>
        <div className="flex items-center mt-1">
          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-white">{formatCurrency(custom.full_price)}</span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <div className="mt-1">
          <Badge variant="outline" className="capitalize">
            {custom.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default PricingStatusSection;
