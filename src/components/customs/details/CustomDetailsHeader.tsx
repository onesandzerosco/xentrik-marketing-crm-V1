
import React from 'react';
import { DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isAfter } from 'date-fns';
import { Custom } from '@/types/custom';

interface CustomDetailsHeaderProps {
  custom: Custom;
}

const CustomDetailsHeader: React.FC<CustomDetailsHeaderProps> = ({ custom }) => {
  const isOverdue = custom.due_date ? isAfter(new Date(), parseISO(custom.due_date)) : false;

  return (
    <DialogTitle className="flex items-center justify-between">
      <span>Custom Details</span>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-brand-yellow border-brand-yellow">
          {custom.model_name}
        </Badge>
        {isOverdue && (
          <Badge variant="destructive" className="text-red-400 border-red-400">
            Overdue
          </Badge>
        )}
      </div>
    </DialogTitle>
  );
};

export default CustomDetailsHeader;
