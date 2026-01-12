import React, { useEffect, useState, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Loader2 } from 'lucide-react';
import { CreatorInvoicingEntry, WeekCutoff } from './types';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface InvoiceChecklistProps {
  creators: { id: string; name: string; model_name: string | null }[];
  generateWeekCutoffs: (count?: number) => WeekCutoff[];
  fetchInvoicingDataRange: (weeks: WeekCutoff[]) => Promise<CreatorInvoicingEntry[]>;
}

export function InvoiceChecklist({
  creators,
  generateWeekCutoffs,
  fetchInvoicingDataRange,
}: InvoiceChecklistProps) {
  const [weeks, setWeeks] = useState<WeekCutoff[]>([]);
  const [invoicingData, setInvoicingData] = useState<CreatorInvoicingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const weekCutoffs = generateWeekCutoffs(12); // Show last 12 weeks
    setWeeks(weekCutoffs);
    
    const data = await fetchInvoicingDataRange(weekCutoffs);
    setInvoicingData(data);
    setLoading(false);
  }, [generateWeekCutoffs, fetchInvoicingDataRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get entry for a creator and week
  const getEntry = (creatorId: string, weekStartStr: string): CreatorInvoicingEntry | undefined => {
    return invoicingData.find(
      entry => entry.creator_id === creatorId && entry.week_start_date === weekStartStr
    );
  };

  // Calculate carry over from previous week
  const calculateCarryOver = (creatorId: string, weekIndex: number): number | null => {
    if (weekIndex === 0) return null; // No previous week for first column

    const prevWeek = weeks[weekIndex - 1];
    const prevEntry = getEntry(creatorId, format(prevWeek.weekStart, 'yyyy-MM-dd'));
    
    if (!prevEntry || prevEntry.net_sales === null) return null;
    
    const invoiceAmount = prevEntry.net_sales * (prevEntry.percentage / 100);
    const paidAmount = prevEntry.paid ?? 0;
    
    // Difference: positive = overpaid (carry over credit), negative = underpaid (debt)
    const difference = paidAmount - invoiceAmount;
    
    // Only return if there's a significant difference (not equal)
    if (Math.abs(difference) < 0.01) return null;
    
    return difference;
  };

  // Render cell content
  const renderCellContent = (creatorId: string, weekIndex: number) => {
    const week = weeks[weekIndex];
    const weekStartStr = format(week.weekStart, 'yyyy-MM-dd');
    const entry = getEntry(creatorId, weekStartStr);
    const carryOver = calculateCarryOver(creatorId, weekIndex);

    // If there's a carry over from previous week, show it
    if (carryOver !== null && Math.abs(carryOver) >= 0.01) {
      const isOverpayment = carryOver > 0;
      return (
        <div
          className={cn(
            "px-2 py-1 rounded text-center font-medium text-sm",
            isOverpayment ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          ${Math.abs(carryOver).toFixed(0)}
        </div>
      );
    }

    // Check if paid
    if (entry?.invoice_payment) {
      return (
        <div className="flex items-center justify-center">
          <Check className="h-5 w-5 text-green-500" />
        </div>
      );
    }

    // Not paid or no data
    return (
      <div className="text-muted-foreground text-center">-</div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[150px] sticky left-0 bg-muted/50 z-10">Model Name</TableHead>
              {weeks.map((week, index) => (
                <TableHead key={index} className="min-w-[100px] text-center whitespace-nowrap">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">Due:</span>
                    <span>{format(week.dueDate, 'MMM d')}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {creators.map((creator) => (
              <TableRow key={creator.id} className="hover:bg-muted/30">
                <TableCell className="font-medium sticky left-0 bg-background z-10">
                  {creator.model_name || creator.name}
                </TableCell>
                {weeks.map((week, weekIndex) => (
                  <TableCell key={weekIndex} className="text-center p-2">
                    {renderCellContent(creator.id, weekIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {creators.length === 0 && (
              <TableRow>
                <TableCell colSpan={weeks.length + 1} className="text-center text-muted-foreground py-8">
                  No creators found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 rounded bg-green-500/20 flex items-center justify-center text-xs font-medium text-green-600 dark:text-green-400">$50</div>
            <span>Overpayment (credit carry-over)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 rounded bg-red-500/20 flex items-center justify-center text-xs font-medium text-red-600 dark:text-red-400">$10</div>
            <span>Underpayment (debt carry-over)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">-</span>
            <span>Not paid / No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
