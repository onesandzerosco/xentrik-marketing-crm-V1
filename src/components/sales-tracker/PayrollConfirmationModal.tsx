import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface PayrollConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatterName: string;
  chatterId: string;
  weekStart: Date;
  totalSales: number;
  currentHourlyRate: number;
  onConfirmed: () => void;
}

const getCommissionRate = (totalSales: number): number => {
  if (totalSales >= 2000) return 3;
  if (totalSales >= 1500) return 2;
  if (totalSales >= 1000) return 1;
  return 0;
};

export const PayrollConfirmationModal: React.FC<PayrollConfirmationModalProps> = ({
  open,
  onOpenChange,
  chatterName,
  chatterId,
  weekStart,
  totalSales,
  currentHourlyRate,
  onConfirmed,
}) => {
  const { toast } = useToast();
  const [hoursWorked, setHoursWorked] = useState<number>(40);
  const [commissionRate, setCommissionRate] = useState<number>(getCommissionRate(totalSales));
  const [isProcessing, setIsProcessing] = useState(false);

  const commissionAmount = (totalSales * commissionRate) / 100;
  const hourlyPay = hoursWorked * currentHourlyRate;
  const totalPayout = hourlyPay + commissionAmount;

  const handleConfirmPayroll = async () => {
    setIsProcessing(true);
    try {
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');

      // Update all sales entries for this chatter and week with confirmation details
      const { error } = await supabase
        .from('sales_tracker')
        .update({
          admin_confirmed: true,
          confirmed_hours_worked: hoursWorked,
          confirmed_commission_rate: commissionRate,
        })
        .eq('chatter_id', chatterId)
        .eq('week_start_date', weekStartStr);

      if (error) throw error;

      toast({
        title: "Payroll Confirmed",
        description: `Payroll confirmed for ${chatterName}. Total payout: $${totalPayout.toFixed(2)}`,
      });

      onConfirmed();
      onOpenChange(false);
    } catch (error) {
      console.error('Error confirming payroll:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payroll",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Payroll - {chatterName}</DialogTitle>
          <DialogDescription>
            Confirm the hours worked and commission rate for the week of {format(weekStart, 'MMM dd, yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Sales:</span>
              <p>${totalSales.toFixed(2)}</p>
            </div>
            <div>
              <span className="font-medium">Hourly Rate:</span>
              <p>${currentHourlyRate.toFixed(2)}/hr</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Hours Worked</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              value={hoursWorked}
              onChange={(e) => setHoursWorked(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">Commission Rate (%)</Label>
            <Select value={commissionRate.toString()} onValueChange={(value) => setCommissionRate(parseFloat(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0% (Below $1000)</SelectItem>
                <SelectItem value="1">1% ($1000-$1499)</SelectItem>
                <SelectItem value="2">2% ($1500-$1999)</SelectItem>
                <SelectItem value="3">3% ($2000+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Hours Pay ({hoursWorked}h × ${currentHourlyRate}/h):</span>
              <span>${hourlyPay.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Commission ({commissionRate}% × ${totalSales.toFixed(2)}):</span>
              <span>${commissionAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total Payout:</span>
              <span>${totalPayout.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPayroll} 
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? 'Processing...' : 'Pay Chatter'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};