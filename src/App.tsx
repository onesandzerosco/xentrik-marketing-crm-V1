
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { AuthProvider } from './context/AuthContext';
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
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <CreatorProvider>
      <ActivityProvider>
        <SupabaseAuthProvider>
          <AuthProvider>
            <div className="app flex h-screen w-full bg-premium-dark">
              <Toaster />
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
            </div>
          </AuthProvider>
        </SupabaseAuthProvider>
      </ActivityProvider>
    </CreatorProvider>
  );
}

export default App;
