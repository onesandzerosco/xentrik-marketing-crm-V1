
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { useAuth, AuthProvider } from './context/AuthContext';
import { CreatorProvider } from './context/CreatorContext';
import { ActivityProvider } from './context/ActivityContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import CreatorAnalytics from './pages/CreatorAnalytics';
import AccountSettings from './pages/AccountSettings';
import NotFound from './pages/NotFound';
import TeamManagement from "./pages/TeamManagement";

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" />;
    }
    
    return <>{children}</>;
  };
  
  return (
    <div className="app">
      <AuthProvider>
        <CreatorProvider>
          <ActivityProvider>
            <BrowserRouter>
              <Toaster />
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
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
                  path="/team" 
                  element={
                    <ProtectedRoute>
                      <TeamManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/creator/:id" 
                  element={
                    <ProtectedRoute>
                      <CreatorProfile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/creator/:id/analytics" 
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
          </ActivityProvider>
        </CreatorProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
