
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicInfoSectionProps {
  formData: {
    model_name: string;
    sale_by: string;
    custom_type: string;
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
          <Input
            id="model_name"
            value={formData.model_name}
            onChange={(e) => onInputChange('model_name', e.target.value)}
            placeholder="Enter model name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="custom_type">Custom Type *</Label>
          <Select value={formData.custom_type} onValueChange={(value) => onInputChange('custom_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select custom type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Photo(s)">Photo(s)</SelectItem>
              <SelectItem value="Video Call">Video Call</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="sale_by">Sale Made By *</Label>
        <Select value={formData.sale_by} onValueChange={(value) => onInputChange('sale_by', value)}>
          <SelectTrigger>
            <SelectValue placeholder={creatorsLoading ? "Loading..." : "Select creator"} />
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
    </>
  );
};

export default BasicInfoSection;
