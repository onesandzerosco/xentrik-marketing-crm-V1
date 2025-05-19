
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceSummary as InvoiceSummaryType } from '../InvoiceTypes';

interface InvoiceSummaryProps {
  summary: InvoiceSummaryType;
  xentrikPercentage: number;
}

export const InvoiceSummary = ({ summary, xentrikPercentage }: InvoiceSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Total Income:</span>
            <span className="text-lg font-bold">${summary.totalIncome.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Xentrik Fee ({xentrikPercentage}%):</span>
            <span className="text-lg font-bold text-red-500">${summary.xentrikAmount.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b">
            <span className="font-medium">Creator Payout ({(100 - xentrikPercentage)}%):</span>
            <span className="text-lg font-bold text-green-500">${summary.creatorAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
