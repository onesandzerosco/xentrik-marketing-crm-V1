
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, User, AlertTriangle } from 'lucide-react';
import type { Custom } from '@/types/customs';

interface CustomCardProps {
  custom: Custom;
  isOverdue: boolean;
  onDragStart: (e: React.DragEvent, custom: Custom) => void;
}

const CustomCard: React.FC<CustomCardProps> = ({ custom, isOverdue, onDragStart }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const truncateDescription = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Card 
      className={`cursor-move hover:shadow-md transition-shadow ${
        isOverdue ? 'border-red-500 bg-red-50' : 'bg-white'
      }`}
      draggable
      onDragStart={(e) => onDragStart(e, custom)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with model name and overdue indicator */}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {custom.model_name}
            </Badge>
            {isOverdue && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">Overdue</span>
              </div>
            )}
          </div>

          {/* Fan info */}
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <div className="text-sm">
              <span className="font-medium">{custom.fan_display_name}</span>
              <span className="text-gray-500 ml-1">(@{custom.fan_username})</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700">
            {truncateDescription(custom.description)}
          </p>

          {/* Due date */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Due: {formatDate(custom.due_date)}
            </span>
          </div>

          {/* Payment info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {formatCurrency(custom.downpayment)} / {formatCurrency(custom.full_price)}
              </span>
            </div>
            <Badge 
              variant={custom.downpayment >= custom.full_price ? "default" : "outline"}
              className="text-xs"
            >
              {custom.downpayment >= custom.full_price ? 'Fully Paid' : 'Partial'}
            </Badge>
          </div>

          {/* Sale info */}
          <div className="text-xs text-gray-500">
            Sale by: {custom.sale_by}
          </div>

          {/* Additional info based on status */}
          {custom.endorsed_by && (
            <div className="text-xs text-gray-500">
              Endorsed by: {custom.endorsed_by}
            </div>
          )}
          {custom.sent_by && (
            <div className="text-xs text-gray-500">
              Sent by: {custom.sent_by}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCard;
