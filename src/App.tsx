
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { CreatorProvider } from './context/creator/CreatorContext';
import { ActivityProvider } from './context/ActivityContext';
import { TeamProvider } from './context/TeamContext';
import { SecureAreaProvider } from './context/SecureAreaContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Creators from './pages/Creators';
import Team from './pages/Team';
import Users from './pages/Users';
import Messages from './pages/Messages';
import SharedFiles from './pages/SharedFiles';
import CreatorFiles from './pages/CreatorFiles';
import SecureLogins from './pages/SecureLogins';
import AccountSettings from './pages/AccountSettings';
import Login from './pages/Login';
import Register from './pages/Register';
import Index from './pages/Index';
import VoiceGeneration from './pages/VoiceGeneration';

// Add import for the new RegisterCreator page
import RegisterCreator from "./pages/RegisterCreator";

function App() {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <CreatorProvider>
          <ActivityProvider>
            <TeamProvider>
              <SecureAreaProvider>
                <Router>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Index />} />
                    
                    <Route path="/register-creator" element={<RegisterCreator />} />

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
                          <Users />
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
                  </Routes>
                </Router>
                <ToastContainer 
                  position="bottom-right" 
                  autoClose={5000} 
                  hideProgressBar={false} 
                  newestOnTop={false} 
                  closeOnClick 
                  rtl={false} 
                  pauseOnFocusLoss 
                  draggable 
                  pauseOnHover 
                  theme="dark" 
                />
              </SecureAreaProvider>
            </TeamProvider>
          </ActivityProvider>
        </CreatorProvider>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}

export default App;
