
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
import { CreatorProvider } from './context/creator';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Team from './pages/Team';
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
          {/* Removed ForgotPassword and ResetPassword routes as requested */}

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
