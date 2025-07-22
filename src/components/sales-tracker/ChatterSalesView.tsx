import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesTrackerTable } from './SalesTrackerTable';
import { SalesTrackerHeader } from './SalesTrackerHeader';

export const ChatterSalesView: React.FC = () => {
  return (
    <div className="space-y-6">
      <SalesTrackerHeader />
      
      <Card className="bg-secondary/10 border-muted">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            My Sales Tracker
            <span className="text-sm text-muted-foreground font-normal">
              (Thursday to Wednesday)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SalesTrackerTable />
        </CardContent>
      </Card>
    </div>
  );
};