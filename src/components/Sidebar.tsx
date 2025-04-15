
import React from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import SidebarLogo from "./sidebar/SidebarLogo";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUserSection from "./sidebar/SidebarUserSection";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed h-screen w-60 bg-premium-darker border-r border-premium-border/50 transition-all duration-300 flex flex-col overflow-hidden">
      <SidebarLogo />
      
      <div className="border-t border-premium-border/30 mt-3 mb-5"></div>

      <div className="flex flex-col h-[calc(100vh-5rem-2rem)] justify-between p-3 overflow-hidden">
        <div className="overflow-y-auto">
          <SidebarNav isAdmin={isAdmin} />
        </div>

        <div className="mt-auto grid gap-1 px-2 transition-opacity duration-300">
          {user && <SidebarUserSection />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
