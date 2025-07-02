
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit2, Check, X } from 'lucide-react';
import { Custom } from '@/types/custom';

interface PricingStatusSectionProps {
  custom: Custom;
  onUpdateDownpayment?: (customId: string, newDownpayment: number) => void;
  isUpdating?: boolean;
}

const PricingStatusSection: React.FC<PricingStatusSectionProps> = ({
  custom,
  onUpdateDownpayment,
  isUpdating
}) => {
  const [isEditingDownpayment, setIsEditingDownpayment] = useState(false);
  const [newDownpayment, setNewDownpayment] = useState(custom.downpayment.toString());

  const handleUpdateDownpayment = () => {
    const amount = parseFloat(newDownpayment);
    if (!isNaN(amount) && amount >= 0 && onUpdateDownpayment) {
      onUpdateDownpayment(custom.id, amount);
      setIsEditingDownpayment(false);
    }
  };

  const handleCancelEdit = () => {
    setNewDownpayment(custom.downpayment.toString());
    setIsEditingDownpayment(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'partially_paid':
        return 'bg-yellow-500';
      case 'fully_paid':
        return 'bg-green-500';
      case 'endorsed':
        return 'bg-blue-500';
      case 'done':
        return 'bg-purple-500';
      case 'refunded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-muted-foreground">Custom Type</Label>
        <Select value={custom.custom_type || 'Not specified'} disabled>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Video">Video</SelectItem>
            <SelectItem value="Photo(s)">Photo(s)</SelectItem>
            <SelectItem value="Video Call">Video Call</SelectItem>
            <SelectItem value="Fan Gift">Fan Gift</SelectItem>
            <SelectItem value="Package">Package</SelectItem>
            <SelectItem value="Not specified">Not specified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-medium text-muted-foreground">Downpayment</Label>
          <div className="flex items-center gap-2 mt-1">
            {isEditingDownpayment ? (
              <>
                <Input
                  type="number"
                  value={newDownpayment}
                  onChange={(e) => setNewDownpayment(e.target.value)}
                  className="flex-1"
                  step="0.01"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={handleUpdateDownpayment}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold">${custom.downpayment.toFixed(2)}</span>
                {onUpdateDownpayment && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingDownpayment(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Full Price</Label>
          <div className="text-lg font-semibold mt-1">${custom.full_price.toFixed(2)}</div>
        </div>

        <div>
          <Label className="text-sm font-medium text-muted-foreground">Status</Label>
          <div className="mt-1">
            <Badge className={`${getStatusColor(custom.status)} text-white`}>
              {custom.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingStatusSection;
