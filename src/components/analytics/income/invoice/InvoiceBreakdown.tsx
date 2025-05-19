
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { InvoiceSummary } from '../InvoiceTypes';

interface InvoiceBreakdownProps {
  summary: InvoiceSummary;
  xentrikPercentage: number;
}

export const InvoiceBreakdown = ({ summary, xentrikPercentage }: InvoiceBreakdownProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Sources Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Xentrik Fee ({xentrikPercentage}%)</TableHead>
              <TableHead className="text-right">Creator Payout ({100 - xentrikPercentage}%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.breakdown.map((item) => (
              <TableRow key={item.source}>
                <TableCell className="font-medium">{item.source}</TableCell>
                <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right text-red-500">${item.xentrikAmount.toFixed(2)}</TableCell>
                <TableCell className="text-right text-green-500">${item.creatorAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/50 font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">${summary.totalIncome.toFixed(2)}</TableCell>
              <TableCell className="text-right text-red-500">${summary.xentrikAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right text-green-500">${summary.creatorAmount.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
