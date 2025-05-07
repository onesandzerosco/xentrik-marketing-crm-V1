
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { CreatorProvider } from "./context/creator";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Creators from "./pages/Creators";
import CreatorProfile from "./pages/CreatorProfile";
import CreatorOnboarding from "./pages/CreatorOnboarding";
import AccessControlPanel from "./pages/AccessControlPanel";
import NotFound from "./pages/NotFound";
import CreatorInviteOnboarding from "./pages/CreatorOnboarding/CreatorInviteOnboarding";

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./components/layouts/DashboardLayout";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        setIsLoading(false);
      }
    );

    checkAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <CreatorProvider>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
              }
            />
            <Route path="/onboard/:token" element={<CreatorInviteOnboarding />} />

            {/* Protected routes with Dashboard Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/creators" element={<Creators />} />
                <Route path="/creators/:id" element={<CreatorProfile />} />
                <Route path="/creators/new" element={<CreatorOnboarding />} />
                <Route path="/access-control" element={<AccessControlPanel />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard if authenticated, otherwise to login */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </CreatorProvider>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}

export default App;
