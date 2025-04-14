
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import Sidebar from '../Sidebar';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex w-full">
      <Sidebar />
      <div className="w-full pl-60 bg-premium-dark">
        {children}
      </div>
    </div>
  );
};

export default ProtectedRoute;
