
import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Custom } from '@/types/custom';
import CustomDetailsHeader from './details/CustomDetailsHeader';
import FanInfoSection from './details/FanInfoSection';
import DescriptionSection from './details/DescriptionSection';
import DatesSection from './details/DatesSection';
import PricingStatusSection from './details/PricingStatusSection';
import AdditionalInfoSection from './details/AdditionalInfoSection';
import TeamInfoSection from './details/TeamInfoSection';
import AttachmentsSection from './details/AttachmentsSection';
import TimestampsSection from './details/TimestampsSection';

interface CustomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: Custom | null;
}

const CustomDetailsModal: React.FC<CustomDetailsModalProps> = ({ isOpen, onClose, custom }) => {
  if (!custom) return null;

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
            {/* Left Column - Dates */}
            <DatesSection custom={custom} />

            {/* Right Column - Pricing and Status */}
            <PricingStatusSection custom={custom} />
          </div>

          {/* Additional Info */}
          <AdditionalInfoSection custom={custom} />

          {/* Team Info */}
          <TeamInfoSection custom={custom} />

          {/* Attachments */}
          <AttachmentsSection custom={custom} />

          {/* Timestamps */}
          <TimestampsSection custom={custom} />
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomDetailsModal;
