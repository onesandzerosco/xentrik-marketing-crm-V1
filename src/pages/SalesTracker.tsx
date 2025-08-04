import React, { useEffect } from 'react';
import { AdminSalesView } from '@/components/sales-tracker/AdminSalesView';
import { ChatterSalesView } from '@/components/sales-tracker/ChatterSalesView';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const SalesTracker: React.FC = () => {
  const { userRole, userRoles, isAuthenticated, user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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

  // Auto-redirect logic for non-admins
  useEffect(() => {
    if (!hasAccess || !user?.id) return;
    
    if (!isAdmin) {
      // Chatters and VAs should always go to their own tracker
      if (!id || id !== user.id) {
        navigate(`/sales-tracker/${user.id}`, { replace: true });
      }
    }
  }, [hasAccess, isAdmin, user?.id, id, navigate]);

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
          <AdminSalesView />
        ) : (
          <ChatterSalesView />
        )}
      </div>
    </div>
  );
};

export default SalesTracker;