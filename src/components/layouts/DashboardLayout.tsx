
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import { SidebarProvider } from "../ui/sidebar";

const DashboardLayout: React.FC = () => {
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
