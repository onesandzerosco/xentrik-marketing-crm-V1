
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
    <aside className="fixed h-screen w-60 bg-premium-darker border-r border-premium-border/30 flex flex-col shadow-premium-md">
      <SidebarLogo />
      
      <div className="border-t border-premium-border/20 mx-4 mt-2 mb-4"></div>

      <div className="flex flex-col h-[calc(100vh-8rem)] p-3 overflow-hidden">
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-premium-border/30 scrollbar-track-transparent pr-1">
          <SidebarNav isAdmin={isAdmin} />
        </div>

        <div className="mt-auto pt-3 border-t border-premium-border/20">
          {user && <SidebarUserSection />}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
