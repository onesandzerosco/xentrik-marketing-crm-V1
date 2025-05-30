
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HttpsEnforcer from "./components/auth/HttpsEnforcer";
import { AuthProvider } from "./context/AuthContext";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import Dashboard from "./pages/Dashboard";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import CreatorOnboardQueue from "./pages/CreatorOnboardQueue";
import CreatorsData from "./pages/CreatorsData";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <HttpsEnforcer />
      <AuthProvider>
        <SupabaseAuthProvider>
          <QueryClientProvider client={queryClient}>
            <SidebarProvider>
              <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a33] to-[#2d1b45] flex w-full">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/onboard-queue" element={<CreatorOnboardQueue />} />
                    <Route path="/creators-data" element={<CreatorsData />} />
                  </Routes>
                </main>
              </div>
            </SidebarProvider>
          </QueryClientProvider>
        </SupabaseAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
