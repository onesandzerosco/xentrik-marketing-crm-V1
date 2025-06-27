
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Custom } from '@/types/custom';
import CustomDetailsHeader from './CustomDetailsHeader';
import FanInfoSection from './FanInfoSection';
import DescriptionSection from './DescriptionSection';
import DatesSection from './DatesSection';
import PricingStatusSection from './PricingStatusSection';
import TeamInfoSection from './TeamInfoSection';
import AttachmentsSection from './AttachmentsSection';
import TimestampsSection from './TimestampsSection';

interface CustomDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  custom: Custom | null;
  onUpdateStatus?: (data: { customId: string; newStatus: string; chatterName?: string }) => void;
  onUpdateDownpayment?: (customId: string, newDownpayment: number) => void;
  onDeleteCustom?: (customId: string) => void;
  isUpdating?: boolean;
}

const CustomDetailsModal: React.FC<CustomDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  custom, 
  onUpdateStatus,
  onUpdateDownpayment,
  onDeleteCustom,
  isUpdating 
}) => {
  if (!custom) return null;

  const handleRefund = () => {
    if (onUpdateStatus && custom) {
      onUpdateStatus({ customId: custom.id, newStatus: 'refunded' });
    }
  };

  const handleDelete = () => {
    if (onDeleteCustom && custom) {
      onDeleteCustom(custom.id);
      onClose();
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
            {onDeleteCustom && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={isUpdating}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Custom
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this custom order and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
