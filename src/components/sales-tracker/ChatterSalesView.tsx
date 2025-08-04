import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesTrackerTable } from './SalesTrackerTable';
import { WeekNavigator } from './WeekNavigator';
import { GoogleSheetsLinkManager } from './GoogleSheetsLinkManager';
import { useAuth } from '@/context/AuthContext';

export const ChatterSalesView: React.FC = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  return (
    <div className="space-y-6">
        <Card className="bg-secondary/10 border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              Weekly Sales Tracker
              <span className="text-sm text-muted-foreground font-normal">
                (Thursday to Wednesday)
              </span>
            </CardTitle>
            <WeekNavigator selectedWeek={selectedWeek} onWeekChange={setSelectedWeek} />
          </div>
          <GoogleSheetsLinkManager chatterId={user?.id} />
        </CardHeader>
        <CardContent>
          <SalesTrackerTable chatterId={user?.id} selectedWeek={selectedWeek} />
        </CardContent>
      </Card>
    </div>
  );
};