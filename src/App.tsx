
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CreatorProvider } from "./context/CreatorContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Creators from "./pages/Creators";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorAnalytics from "./pages/CreatorAnalytics";
import AccountSettings from "./pages/AccountSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CreatorProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/creators" 
                element={
                  <ProtectedRoute>
                    <Creators />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/creators/:id" 
                element={
                  <ProtectedRoute>
                    <CreatorProfile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/creators/:id/analytics" 
                element={
                  <ProtectedRoute>
                    <CreatorAnalytics />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/account" 
                element={
                  <ProtectedRoute>
                    <AccountSettings />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CreatorProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
