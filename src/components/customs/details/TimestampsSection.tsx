
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Custom } from '@/types/custom';

interface TimestampsSectionProps {
  custom: Custom;
}

const TimestampsSection: React.FC<TimestampsSectionProps> = ({ custom }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground border-t border-border pt-4">
      <div>
        <span>Created: {format(parseISO(custom.created_at), 'MMM dd, yyyy HH:mm')}</span>
      </div>
      <div>
        <span>Updated: {format(parseISO(custom.updated_at), 'MMM dd, yyyy HH:mm')}</span>
      </div>
    </div>
  );
};

export default TimestampsSection;
