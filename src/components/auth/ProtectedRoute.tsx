
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import PageTransition from '../PageTransition';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import SidebarLogo from '../sidebar/SidebarLogo';
import SidebarNav from '../sidebar/SidebarNav';
import SidebarUserSection from '../sidebar/SidebarUserSection';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const { user } = useSupabaseAuth();
  const location = useLocation();
  
  // Store current path when user navigates
  useEffect(() => {
    if (isAuthenticated && location.pathname !== "/login") {
      localStorage.setItem("lastVisitedRoute", location.pathname);
    }
  }, [location.pathname, isAuthenticated]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-premium-darker">
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

  const isAdmin = user?.role === "Admin";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarContent className="pt-8">
            <SidebarLogo />
            <div className="px-3 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-premium-border/30 scrollbar-track-transparent mt-4">
              <SidebarNav isAdmin={isAdmin} />
            </div>
            <div className="mt-auto p-3 border-t border-premium-border/20">
              {user && <SidebarUserSection />}
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-premium-dark overflow-y-auto">
          <div className="flex items-center border-b border-premium-border/20 bg-premium-darker p-4">
            <SidebarTrigger />
            <h1 className="ml-4 text-lg font-semibold">Dashboard</h1>
          </div>
          
          <PageTransition>
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </PageTransition>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedRoute;
