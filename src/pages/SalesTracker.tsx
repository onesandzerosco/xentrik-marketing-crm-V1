import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SalesTrackerTable } from '@/components/sales-tracker/SalesTrackerTable';
import { SalesTrackerHeader } from '@/components/sales-tracker/SalesTrackerHeader';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

const SalesTracker: React.FC = () => {
  const { userRole, userRoles, isAuthenticated } = useAuth();

  // Check if user has access to Sales Tracker
  const hasAccess = isAuthenticated && (
    userRole === 'Admin' || 
    userRoles?.includes('Admin') ||
    userRole === 'Chatter' || 
    userRoles?.includes('Chatter') ||
    userRole === 'VA' || 
    userRoles?.includes('VA')
  );

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-premium-dark flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the Sales Tracker. This module is only available to Admin, Chatter, and VA users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-dark">
      <div className="container mx-auto p-4 space-y-6">
        <SalesTrackerHeader />
        
        <Card className="bg-secondary/10 border-muted">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              Weekly Sales Tracker
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
    </div>
  );
};

export default SalesTracker;