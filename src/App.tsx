import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { TeamProvider } from './context/TeamContext';
import { CreatorProvider } from './context/CreatorContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Team from './pages/Team';
import Profile from './pages/Profile';
import CreatorManagement from './pages/CreatorManagement';
import CreatorOnboarding from './pages/CreatorOnboarding';
import CreatorProfilePage from './pages/CreatorProfilePage';
import CreatorDetailsPage from './pages/CreatorDetailsPage';
import CreatorPayoutsPage from './pages/CreatorPayoutsPage';
import CreatorContentApprovalsPage from './pages/CreatorContentApprovalsPage';
import CreatorAnalyticsPage from './pages/CreatorAnalyticsPage';
import CreatorVault from './pages/CreatorVault';
import OnboardingPage from './pages/OnboardingPage';
import { setupDatabaseFunctions } from './utils/db-helpers';

function App() {
  // Initialize database functions once on app load
  React.useEffect(() => {
    setupDatabaseFunctions()
      .then(() => console.log("Database functions setup complete"))
      .catch(err => console.error("Failed to set up database functions:", err));
  }, []);

  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding/:token" element={<OnboardingPage />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/team"
            element={
              <PrivateRoute>
                <Team />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators"
            element={
              <PrivateRoute>
                <CreatorManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/onboarding"
            element={
              <PrivateRoute>
                <CreatorOnboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/:creatorId"
            element={
              <PrivateRoute>
                <CreatorProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/:creatorId/details"
            element={
              <PrivateRoute>
                <CreatorDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/:creatorId/payouts"
            element={
              <PrivateRoute>
                <CreatorPayoutsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/:creatorId/content-approvals"
            element={
              <PrivateRoute>
                <CreatorContentApprovalsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/creators/:creatorId/analytics"
            element={
              <PrivateRoute>
                <CreatorAnalyticsPage />
              </PrivateRoute>
            }
          />
           <Route
            path="/creators/:creatorId/vault"
            element={
              <PrivateRoute>
                <CreatorVault />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    
  );
}

function RootApp() {
  return (
    
      
        
          <App />
        
      
    
  );
}

export default RootApp;
