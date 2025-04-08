
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
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import TeamManagement from "./pages/TeamManagement";
import Sidebar from './components/Sidebar';

function App() {
  return (
    <AuthProvider>
      <CreatorProvider>
        <ActivityProvider>
          <BrowserRouter>
            <div className="app flex">
              <Toaster />
              <AppRoutes />
            </div>
          </BrowserRouter>
        </ActivityProvider>
      </CreatorProvider>
    </AuthProvider>
  );
}

// Create a separate component for routes to avoid using hooks at the top level
const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" />;
    }
    
    return (
      <div className="flex w-full">
        <Sidebar />
        <div className="ml-60 flex-1 w-full">
          {children}
        </div>
      </div>
    );
  };
  
  return (
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
        path="/messages" 
        element={
          <ProtectedRoute>
            <Messages />
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
  );
};

export default App;
