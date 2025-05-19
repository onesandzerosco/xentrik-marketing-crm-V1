
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceSummary as InvoiceSummaryType } from '../InvoiceTypes';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType;
  xentrikPercentage: number;
}

export const InvoiceSummary = ({ summary, xentrikPercentage }: InvoiceSummaryProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Total Income</span>
                <span className="font-medium">{formatCurrency(summary.totalIncome)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-blue-400">Xentrik Fee ({xentrikPercentage}%)</span>
                <span className="font-medium text-blue-400">{formatCurrency(summary.xentrikAmount)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-green-400">Creator Amount</span>
                <span className="font-medium text-green-400">{formatCurrency(summary.creatorAmount)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <span className="text-lg font-semibold">Creator Payout</span>
            <span className="text-xl font-bold">{formatCurrency(summary.creatorAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
