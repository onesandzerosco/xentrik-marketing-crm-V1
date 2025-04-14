
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Auth0ContextProvider } from './context/Auth0Context';
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
import UserManagement from './pages/UserManagement';
import Team from './pages/Team';
import TeamMemberProfile from './pages/TeamMemberProfile';
import SecureLogins from './pages/SecureLogins';
import Sidebar from './components/Sidebar';
import Index from './pages/Index';
import { useAuth0 } from '@auth0/auth0-react';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <CreatorProvider>
      <ActivityProvider>
        <Auth0ContextProvider>
          <div className="app flex h-screen w-full bg-premium-dark">
            <Toaster />
            <AppRoutes />
          </div>
        </Auth0ContextProvider>
      </ActivityProvider>
    </CreatorProvider>
  );
}

// Create a separate component for routes
const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  
  // If Auth0 is still loading, you might want to show a loading state
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/team/:id" element={<ProtectedRoute><TeamMemberProfile /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/creators/:id" element={<ProtectedRoute><CreatorProfile /></ProtectedRoute>} />
      <Route path="/creators/:id/analytics" element={<ProtectedRoute><CreatorAnalytics /></ProtectedRoute>} />
      <Route path="/secure-logins" element={<ProtectedRoute><SecureLogins /></ProtectedRoute>} />
      <Route path="/secure-logins/:id" element={<ProtectedRoute><SecureLogins /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
