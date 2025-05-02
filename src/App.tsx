import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Creators from './pages/Creators';
import Team from './pages/Team';
import UserManagement from './pages/UserManagement';
import Messages from './pages/Messages';
import SharedFiles from './pages/SharedFiles';
import CreatorFiles from './pages/CreatorFiles';
import SecureLogins from './pages/SecureLogins';
import AccountSettings from './pages/AccountSettings';
import VoiceGeneration from './pages/VoiceGeneration';

// Import the AuthProvider from the context
import { AuthProvider } from './context/AuthContext';
import { CreatorsProvider } from './context/creator';
import { EmployeesProvider } from './context/employee';
import { SecureLoginsProvider } from './context/secureLogins';
import { ToastProvider } from "@/components/ui/use-toast"

// Import the AccessControlPanel component
import AccessControlPanel from "./pages/AccessControlPanel";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CreatorsProvider>
          <EmployeesProvider>
            <SecureLoginsProvider>
              <Router>
                <Routes>
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
                        <Team />
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
                    path="/shared-files"
                    element={
                      <ProtectedRoute>
                        <SharedFiles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/creator-files/:creatorId"
                    element={
                      <ProtectedRoute>
                        <CreatorFiles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/secure-logins"
                    element={
                      <ProtectedRoute>
                        <SecureLogins />
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
                  <Route
                    path="/voice-generation"
                    element={
                      <ProtectedRoute>
                        <VoiceGeneration />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Add the new AccessControlPanel route */}
                  <Route 
                    path="/access-control" 
                    element={
                      <ProtectedRoute>
                        <AccessControlPanel />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </Router>
            </SecureLoginsProvider>
          </EmployeesProvider>
        </CreatorsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
