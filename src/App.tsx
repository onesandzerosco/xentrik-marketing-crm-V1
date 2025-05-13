import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { AuthProvider } from './context/AuthContext';
import { CreatorProvider } from './context/creator';
import { ActivityProvider } from './context/ActivityContext';
import { TeamProvider } from './context/TeamContext';
import { AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Creators from './pages/Creators';
import CreatorProfile from './pages/CreatorProfile';
import CreatorAnalytics from './pages/CreatorAnalytics';
import CreatorOnboarding from './pages/CreatorOnboarding';
import AccountSettings from './pages/AccountSettings';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import UserManagement from './pages/UserManagement';
import Team from './pages/Team';
import TeamMemberProfile from './pages/TeamMemberProfile';
import TeamMemberOnboarding from './pages/TeamMemberOnboarding';
import SecureLogins from './pages/SecureLogins';
import Index from './pages/Index';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { ensureStorageBucket } from "./utils/setupStorage";
import SharedFiles from './pages/SharedFiles';
import CreatorFiles from './pages/CreatorFiles';
import TeamMemberEdit from './pages/TeamMemberEdit';
import VoiceGeneration from './pages/VoiceGeneration';
import CreatorUpload from './pages/CreatorUpload';
import AccessControlPanel from './pages/AccessControlPanel';
import CreatorInviteOnboarding from './pages/CreatorOnboarding/CreatorInviteOnboarding';
import CreatorOnboardForm from './pages/CreatorOnboardForm';
import CreatorOnboardQueue from './pages/CreatorOnboardQueue';
import { setupDatabaseFunctions } from './utils/db-helpers';

// Call the function to ensure our storage bucket exists
// We're calling it here in a non-blocking way
ensureStorageBucket().catch(err => {
  console.error("Error setting up storage bucket:", err);
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  // Setup database functions once when the app loads
  useEffect(() => {
    setupDatabaseFunctions().catch(err => {
      console.error("Error setting up database functions:", err);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CreatorProvider>
        <ActivityProvider>
          <SupabaseAuthProvider>
            <AuthProvider>
              <TeamProvider>
                <div className="app flex h-screen w-full bg-premium-dark">
                  <Toaster />
                  <AnimatePresence mode="wait">
                    <AppRoutes />
                  </AnimatePresence>
                </div>
              </TeamProvider>
            </AuthProvider>
          </SupabaseAuthProvider>
        </ActivityProvider>
      </CreatorProvider>
    </QueryClientProvider>
  );
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/creators" element={<ProtectedRoute><Creators /></ProtectedRoute>} />
      <Route path="/creators/onboard" element={<ProtectedRoute><CreatorOnboarding /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/team/onboard" element={<ProtectedRoute><TeamMemberOnboarding /></ProtectedRoute>} />
      <Route path="/team/:id" element={<ProtectedRoute><TeamMemberProfile /></ProtectedRoute>} />
      <Route path="/team/:id/edit" element={<ProtectedRoute><TeamMemberEdit /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/access-control" element={<ProtectedRoute><AccessControlPanel /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/shared-files" element={<ProtectedRoute><SharedFiles /></ProtectedRoute>} />
      <Route path="/creator-files/:id" element={<ProtectedRoute><CreatorFiles /></ProtectedRoute>} />
      <Route path="/creators/:id" element={<ProtectedRoute><CreatorProfile /></ProtectedRoute>} />
      <Route path="/creators/:id/analytics" element={<ProtectedRoute><CreatorAnalytics /></ProtectedRoute>} />
      <Route path="/secure-logins" element={<ProtectedRoute><SecureLogins /></ProtectedRoute>} />
      <Route path="/secure-logins/:id" element={<ProtectedRoute><SecureLogins /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
      <Route path="/shared/:shareCode" element={<SharedFiles />} />
      <Route path="/voice-generation" element={<ProtectedRoute><VoiceGeneration /></ProtectedRoute>} />
      <Route path="/upload/:id" element={<CreatorUpload />} />
      
      {/* New creator onboarding form - Admin only */}
      <Route path="/onboard" element={<ProtectedRoute><CreatorOnboardForm /></ProtectedRoute>} />
      
      {/* New admin onboard queue - Admin only */}
      <Route path="/onboard-queue" element={<ProtectedRoute><CreatorOnboardQueue /></ProtectedRoute>} />
      
      {/* Public route for creator onboarding from invitation */}
      <Route path="/onboard/:token" element={<CreatorInviteOnboarding />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
