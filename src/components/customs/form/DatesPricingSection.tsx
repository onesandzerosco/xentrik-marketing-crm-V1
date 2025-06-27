
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { PremiumInput } from '@/components/ui/premium-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DatesPricingSectionProps {
  formData: {
    sale_date: string;
    due_date: string;
    downpayment: string;
    full_price: string;
    status: string;
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
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => onInputChange('due_date', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="downpayment">Downpayment *</Label>
          <PremiumInput
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

        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="fully_paid">Fully Paid</SelectItem>
              <SelectItem value="endorsed">Endorsed</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default DatesPricingSection;
