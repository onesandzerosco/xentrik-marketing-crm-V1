
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { SidebarProvider } from "../ui/sidebar";
import useRouteMemory from "@/hooks/useRouteMemory";

const DashboardLayout: React.FC = () => {
  // Use the route memory hook to save the last visited route
  useRouteMemory();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-premium-dark">
        <Sidebar />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
