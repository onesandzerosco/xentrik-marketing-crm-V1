
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryStatsProps {
  total: number;
  average: number;
  highest: number;
  incomeSource: string;
}

export const SummaryCards = ({ total, average, highest, incomeSource }: SummaryStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <CardDescription>
            {incomeSource !== 'total' ? `From ${incomeSource}` : 'All sources'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${total}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Daily Income</CardTitle>
          <CardDescription>For selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${average}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Highest Daily Income</CardTitle>
          <CardDescription>Peak earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${highest}</div>
        </CardContent>
      </Card>
    </div>
  );
};
