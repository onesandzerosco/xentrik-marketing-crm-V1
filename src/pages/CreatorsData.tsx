
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CreatorsDataTable from '@/components/creators-data/CreatorsDataTable';

const CreatorsData: React.FC = () => {
  const { userRole, userRoles } = useAuth();
  
  // Check if user has access (Admin, VA, or Chatter)
  const hasAccess = userRole === 'Admin' || 
                   userRoles?.includes('Admin') ||
                   userRole === 'VA' || 
                   userRoles?.includes('VA') ||
                   userRole === 'Chatter' || 
                   userRoles?.includes('Chatter');

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Model Profile</h1>
        <p className="text-muted-foreground mt-2">
          View JSON data from accepted creator onboarding submissions
        </p>
      </div>
      
      <CreatorsDataTable />
    </div>
  );
};

export default CreatorsData;
