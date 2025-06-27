
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  formData: {
    model_name: string;
    custom_type: string;
    sale_by: string;
    status: string;
  };
  creators: Array<{ id: string; name: string }>;
  creatorsLoading: boolean;
  onInputChange: (field: string, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  creators,
  creatorsLoading,
  onInputChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="model_name">Model Name *</Label>
          <Select value={formData.model_name} onValueChange={(value) => onInputChange('model_name', value)} required>
            <SelectTrigger>
              <SelectValue placeholder={creatorsLoading ? "Loading creators..." : "Select a model"} />
            </SelectTrigger>
            <SelectContent>
              {creators.map((creator) => (
                <SelectItem key={creator.id} value={creator.name}>
                  {creator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="custom_type">Custom Type</Label>
          <Input
            id="custom_type"
            value={formData.custom_type}
            onChange={(e) => onInputChange('custom_type', e.target.value)}
            placeholder="e.g., Video, Photo, Audio"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sale_by">Sale Made By *</Label>
          <Input
            id="sale_by"
            value={formData.sale_by}
            onChange={(e) => onInputChange('sale_by', e.target.value)}
            placeholder="Who made this sale?"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => onInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="fully_paid">Fully Paid</SelectItem>
              <SelectItem value="endorsed">Endorsed</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};

export default BasicInfoSection;
