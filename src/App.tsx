
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// Fix the import path for ThemeProvider
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import CreatorProfile from "./pages/CreatorProfile";
import Creators from "./pages/Creators";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Team from "./pages/Team";
import TeamMemberEdit from "./pages/TeamMemberEdit";
import TeamMemberProfile from "./pages/TeamMemberProfile";
import TeamMemberOnboarding from "./pages/TeamMemberOnboarding";

import { setupDatabaseFunctions } from "./utils/db-helpers";
import "./App.css";

function App() {
  useEffect(() => {
    // Set up the database functions
    setupDatabaseFunctions();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SupabaseAuthProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/creator/profile/:id" element={<CreatorProfile />} />
            <Route path="/creators" element={<Creators />} />
            <Route path="/login" element={<Login />} />
            <Route path="/team" element={<Team />} />
            <Route path="/team/edit/:id" element={<TeamMemberEdit />} />
            <Route path="/team/profile/:id" element={<TeamMemberProfile />} />
            <Route path="/team/onboard" element={<TeamMemberOnboarding />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;
