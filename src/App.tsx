
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { useAuth, AuthProvider } from './context/AuthContext';
import { CreatorProvider } from './context/CreatorContext';
import { ActivityProvider } from './context/ActivityContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import CreatorAnalytics from './pages/CreatorAnalytics';
import AccountSettings from './pages/AccountSettings';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import UserManagement from './pages/UserManagement';
import Team from './pages/Team';
import TeamMemberProfile from './pages/TeamMemberProfile';
import Sidebar from './components/Sidebar';
import Index from './pages/Index';

function App() {
  return (
    <AuthProvider>
      <CreatorProvider>
        <ActivityProvider>
          <BrowserRouter>
            <div className="app flex h-screen w-full bg-premium-dark">
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
        <div className="w-full pl-60 bg-premium-dark">
          {children}
        </div>
      </div>
    );
  };
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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
            <Team />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/team/:id" 
        element={
          <ProtectedRoute>
            <TeamMemberProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UserManagement />
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
  );
};

export default App;
