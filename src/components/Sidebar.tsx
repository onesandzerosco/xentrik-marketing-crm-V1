
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarTrigger
} from "@/components/ui/sidebar";
import SidebarLogo from "./sidebar/SidebarLogo";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUserSection from "./sidebar/SidebarUserSection";

const Sidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  
  // Store current location path in localStorage when it changes
  useEffect(() => {
    if (location.pathname !== "/login" && !location.pathname.includes("/auth")) {
      localStorage.setItem("lastVisitedRoute", location.pathname);
    }
  }, [location.pathname]);

  if (isMobile) {
    return null;
  }

  return (
    <SidebarComponent>
      <div className="relative h-full flex flex-col">
        <div className="absolute top-4 right-2">
          <SidebarTrigger />
        </div>
        
        <SidebarContent className="pt-8 h-full flex flex-col">
          <SidebarLogo />
          
          <div className="px-3 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-premium-border/30 scrollbar-track-transparent mt-4">
            <SidebarNav isAdmin={isAdmin} />
          </div>

          {user && <div className="mb-4"><SidebarUserSection /></div>}
        </SidebarContent>
      </div>
    </SidebarComponent>
  );
};

export default Sidebar;
