
import React from 'react';
import { PremiumCard } from '@/components/ui/premium-card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User, AlertTriangle, Paperclip } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';

interface Custom {
  id: string;
  model_name: string;
  fan_display_name: string;
  fan_username: string | null;
  description: string;
  sale_date: string;
  due_date: string | null;
  downpayment: number;
  full_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  sale_by: string;
  endorsed_by?: string;
  sent_by?: string;
  attachments?: string[] | null;
}

interface CustomCardProps {
  custom: Custom;
  onDragStart: (e: React.DragEvent, custom: Custom) => void;
  isDragging: boolean;
  isUpdating: boolean;
}

const CustomCard: React.FC<CustomCardProps> = ({ 
  custom, 
  onDragStart, 
  isDragging, 
  isUpdating 
}) => {
  // Handle optional due date - only check for overdue if due_date exists
  const isOverdue = custom.due_date ? isAfter(new Date(), parseISO(custom.due_date)) : false;
  const isPaid = custom.downpayment >= custom.full_price;
  
  const truncateDescription = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <PremiumCard
      className={`cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'
      } ${isOverdue ? 'border-red-500/50' : ''} ${
        isUpdating ? 'pointer-events-none opacity-70' : ''
      }`}
      draggable={!isUpdating}
      onDragStart={(e) => onDragStart(e, custom)}
    >
      <div className="p-4 space-y-3">
        {/* Header with Model Name and Overdue Indicator */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-brand-yellow border-brand-yellow">
            {custom.model_name}
          </Badge>
          <div className="flex items-center gap-2">
            {custom.attachments && custom.attachments.length > 0 && (
              <div className="flex items-center text-muted-foreground text-xs">
                <Paperclip className="h-3 w-3 mr-1" />
                {custom.attachments.length}
              </div>
            )}
            {isOverdue && (
              <div className="flex items-center text-red-400 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </div>
            )}
          </div>
        </div>

        {/* Fan Information */}
        <div className="flex items-center text-sm text-muted-foreground">
          <User className="h-3 w-3 mr-1" />
          <span className="font-medium text-white">{custom.fan_display_name}</span>
          {custom.fan_username && (
            <span className="ml-1">(@{custom.fan_username})</span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 leading-relaxed">
          {truncateDescription(custom.description)}
        </p>

        {/* Payment Information */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-3 w-3 mr-1" />
            <span>
              {formatCurrency(custom.downpayment)} / {formatCurrency(custom.full_price)}
            </span>
          </div>
          {isPaid && (
            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
              Paid
            </Badge>
          )}
        </div>

        {/* Due Date - only show if due_date exists */}
        {custom.due_date && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>Due: {format(parseISO(custom.due_date), 'MMM dd, yyyy')}</span>
          </div>
        )}

        {/* Sale Information */}
        <div className="text-xs text-muted-foreground">
          Sold by: {custom.sale_by}
          {custom.endorsed_by && <span className="ml-2">• Endorsed by: {custom.endorsed_by}</span>}
          {custom.sent_by && <span className="ml-2">• Sent by: {custom.sent_by}</span>}
        </div>
      </div>
    </PremiumCard>
  );
};

export default CustomCard;
