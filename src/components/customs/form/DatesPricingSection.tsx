
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DatesPricingSectionProps {
  formData: {
    sale_date: string;
    due_date: string;
    downpayment: string;
    full_price: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const DatesPricingSection: React.FC<DatesPricingSectionProps> = ({
  formData,
  onInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sale_date">Sale Date *</Label>
          <Input
            id="sale_date"
            type="date"
            value={formData.sale_date}
            onChange={(e) => onInputChange('sale_date', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="due_date">Due Date (Optional)</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => onInputChange('due_date', e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Leave empty if no specific due date is required
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="downpayment">Downpayment *</Label>
          <Input
            id="downpayment"
            type="number"
            step="0.01"
            min="0"
            value={formData.downpayment}
            onChange={(e) => onInputChange('downpayment', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="full_price">Full Price *</Label>
          <Input
            id="full_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.full_price}
            onChange={(e) => onInputChange('full_price', e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
      </div>
    </>
  );
};

export default DatesPricingSection;
