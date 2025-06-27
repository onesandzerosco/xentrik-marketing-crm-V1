import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import "./App.css";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/sidebar/Sidebar";
import Team from "./pages/Team";
import Onboarding from "./pages/Onboarding";
import PageTransition from "./components/PageTransition";
import SecureArea from "./pages/SecureArea";
import FileManager from "./pages/FileManager";
import ModelAnnouncements from "./pages/ModelAnnouncements";
import CustomsTracker from "./pages/CustomsTracker";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <Dashboard />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <Team />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <Onboarding />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/secure-area"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <SecureArea />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/file-manager"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <FileManager />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/model-announcements"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <ModelAnnouncements />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/customs-tracker" 
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 ml-64">
                    <PageTransition>
                      <CustomsTracker />
                    </PageTransition>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
          
        </Routes>
      </Router>
    </div>
  );
}

export default App;
