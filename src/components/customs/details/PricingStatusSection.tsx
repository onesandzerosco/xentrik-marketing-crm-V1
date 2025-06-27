
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PremiumInput } from '@/components/ui/premium-input';
import { DollarSign, Edit, Check, X } from 'lucide-react';
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
  const [editedDownpayment, setEditedDownpayment] = useState(custom.downpayment.toString());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleEditDownpayment = () => {
    setIsEditingDownpayment(true);
    setEditedDownpayment(custom.downpayment.toString());
  };

  const handleSaveDownpayment = () => {
    const newAmount = parseFloat(editedDownpayment);
    if (!isNaN(newAmount) && newAmount >= 0 && onUpdateDownpayment) {
      onUpdateDownpayment(custom.id, newAmount);
      setIsEditingDownpayment(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingDownpayment(false);
    setEditedDownpayment(custom.downpayment.toString());
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Downpayment</label>
        <div className="flex items-center mt-1 gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {isEditingDownpayment ? (
            <div className="flex items-center gap-2 flex-1">
              <PremiumInput
                type="number"
                step="0.01"
                min="0"
                value={editedDownpayment}
                onChange={(e) => setEditedDownpayment(e.target.value)}
                className="flex-1"
                disabled={isUpdating}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveDownpayment}
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
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-white">{formatCurrency(custom.downpayment)}</span>
              {onUpdateDownpayment && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditDownpayment}
                  disabled={isUpdating}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-white"
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
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
