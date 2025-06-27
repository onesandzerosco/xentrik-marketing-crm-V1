
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Custom } from '@/types/custom';
import CustomDetailsHeader from './details/CustomDetailsHeader';
import FanInfoSection from './details/FanInfoSection';
import DescriptionSection from './details/DescriptionSection';
import DatesSection from './details/DatesSection';
import PricingStatusSection from './details/PricingStatusSection';
import TeamInfoSection from './details/TeamInfoSection';
import AttachmentsSection from './details/AttachmentsSection';
import TimestampsSection from './details/TimestampsSection';

interface CustomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: Custom | null;
  onUpdateStatus?: (data: { customId: string; newStatus: string; chatterName?: string }) => void;
  onUpdateDownpayment?: (customId: string, newDownpayment: number) => void;
  isUpdating?: boolean;
}

const CustomDetailsModal: React.FC<CustomDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  custom, 
  onUpdateStatus,
  onUpdateDownpayment,
  isUpdating 
}) => {
  if (!custom) return null;

  const handleRefund = () => {
    if (onUpdateStatus && custom) {
      onUpdateStatus({ customId: custom.id, newStatus: 'refunded' });
    }
  };

  const canRefund = custom.status !== 'refunded' && onUpdateStatus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <CustomDetailsHeader custom={custom} />
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Fan Information */}
          <FanInfoSection custom={custom} />

          {/* Description */}
          <DescriptionSection custom={custom} />

          {/* Dates and Pricing - Reorganized Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Dates and Custom Type */}
            <DatesSection custom={custom} />

            {/* Right Column - Pricing and Status */}
            <PricingStatusSection 
              custom={custom} 
              onUpdateDownpayment={onUpdateDownpayment}
              isUpdating={isUpdating}
            />
          </div>

          {/* Team Info */}
          <TeamInfoSection custom={custom} />

          {/* Attachments */}
          <AttachmentsSection custom={custom} />

          {/* Timestamps */}
          <TimestampsSection custom={custom} />
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {canRefund && (
              <Button 
                variant="destructive" 
                onClick={handleRefund}
                disabled={isUpdating}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Mark as Refunded
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDetailsModal;
