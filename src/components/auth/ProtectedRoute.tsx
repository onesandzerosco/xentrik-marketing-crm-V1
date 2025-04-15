
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import Sidebar from '../Sidebar';
import PageTransition from '../PageTransition';
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex w-full h-screen">
      <Sidebar />
      <div className="w-full pl-60 bg-premium-dark flex flex-col">
        <ScrollArea className="h-full w-full">
          <PageTransition>
            <div className="p-4">
              {children}
            </div>
          </PageTransition>
        </ScrollArea>
      </div>
    </div>
  );
};

export default ProtectedRoute;
