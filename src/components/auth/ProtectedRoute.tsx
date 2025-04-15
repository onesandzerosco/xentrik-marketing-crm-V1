
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import Sidebar from '../Sidebar';
import PageTransition from '../PageTransition';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1A1F2C]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-premium-border border-t-brand-yellow"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex w-full">
      <Sidebar />
      <main className="w-full pl-60 bg-premium-dark h-screen overflow-y-auto">
        <PageTransition>
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default ProtectedRoute;
