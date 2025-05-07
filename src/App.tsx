
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HttpsRedirect } from 'react-https-redirect';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/NotFound';
import UserManagement from './pages/UserManagement';
import AccessControlPanel from './pages/AccessControlPanel';
import Creators from './pages/Creators';
import CreatorOnboarding from './pages/CreatorOnboarding';
import CreatorInviteOnboarding from './pages/CreatorOnboarding/CreatorInviteOnboarding';
import CreatorProfile from './pages/CreatorProfile';

const App: React.FC = () => {
  const isLocalhost = window.location.hostname === 'localhost';
  
  return (
    <HttpsRedirect disabled={isLocalhost}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Creator onboarding route - publicly accessible via token */}
        <Route path="/onboard/:token" element={<CreatorInviteOnboarding />} />
        
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/access-control" element={<AccessControlPanel />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/creators/:id" element={<CreatorProfile />} />
            <Route path="/onboarding" element={<CreatorOnboarding />} />
          </Route>
        </Route>
        
        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HttpsRedirect>
  );
};

export default App;
