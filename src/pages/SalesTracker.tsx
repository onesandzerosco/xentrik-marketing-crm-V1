import React, { useState } from 'react';
import { AdminSalesView } from '@/components/sales-tracker/AdminSalesView';
import { ChatterSalesView } from '@/components/sales-tracker/ChatterSalesView';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

const SalesTracker: React.FC = () => {
  const { userRole, userRoles, isAuthenticated } = useAuth();
  const [selectedChatterId, setSelectedChatterId] = useState<string | null>(null);

  // Check if user has access to Sales Tracker
  const hasAccess = isAuthenticated && (
    userRole === 'Admin' || 
    userRoles?.includes('Admin') ||
    userRole === 'VA' || 
    userRoles?.includes('VA') ||
    userRole === 'Chatter' || 
    userRoles?.includes('Chatter')
  );

  const isAdmin = userRole === 'Admin' || userRoles?.includes('Admin');
  const isVA = userRole === 'VA' || userRoles?.includes('VA');
  const isChatter = userRole === 'Chatter' || userRoles?.includes('Chatter');

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-premium-dark flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the Sales Tracker.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-premium-dark">
      <div className="container mx-auto p-4">
        {isAdmin ? (
          <AdminSalesView 
            selectedChatterId={selectedChatterId}
            onSelectChatter={setSelectedChatterId}
          />
        ) : (
          <ChatterSalesView />
        )}
      </div>
    </div>
  );
};

export default SalesTracker;