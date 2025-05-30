import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HttpsEnforcer from "./components/HttpsEnforcer";
import { AuthProvider } from "./context/AuthContext";
import { SupabaseAuthProvider } from "./context/SupabaseAuthProvider";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import Folders from "./pages/Folders";
import Shared from "./pages/Shared";
import Trash from "./pages/Trash";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import Creator from "./pages/Creator";
import { CreatorProvider } from "./context/CreatorContext";
import { ActivityProvider } from "./context/ActivityContext";
import { TeamProvider } from "./context/TeamContext";
import { QueryClient } from "./components/QueryClient";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./context/SidebarContext";
import CreatorOnboardQueue from "./pages/CreatorOnboardQueue";
import CreatorsData from "./pages/CreatorsData";

function App() {
  return (
    <BrowserRouter>
      <HttpsEnforcer />
      <AuthProvider>
        <SupabaseAuthProvider>
          <CreatorProvider>
            <ActivityProvider>
              <TeamProvider>
                <QueryClient>
                  <SidebarProvider>
                    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a33] to-[#2d1b45] flex w-full">
                      <Sidebar />
                      <main className="flex-1 overflow-auto">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/files" element={<Files />} />
                          <Route path="/folders" element={<Folders />} />
                          <Route path="/shared" element={<Shared />} />
                          <Route path="/trash" element={<Trash />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/team" element={<Team />} />
                          <Route path="/activity" element={<Activity />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/onboarding/:token" element={<Onboarding />} />
                          <Route path="/creator/:id" element={<Creator />} />
                          <Route path="/onboard-queue" element={<CreatorOnboardQueue />} />
                          <Route path="/creators-data" element={<CreatorsData />} />
                        </Routes>
                      </main>
                    </div>
                  </SidebarProvider>
                </QueryClient>
              </TeamProvider>
            </ActivityProvider>
          </CreatorProvider>
        </SupabaseAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
