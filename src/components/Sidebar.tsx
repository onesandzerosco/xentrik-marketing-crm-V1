
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BarChart2, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen w-60 bg-sidebar fixed left-0 top-0 border-r border-border flex flex-col">
      <div className="p-6">
        <div className="mb-8 flex justify-center">
          <img 
            src="/lovable-uploads/983659fc-5fdc-41ec-b019-cd6578bbbb3e.png" 
            alt="XENTRIK MARKETING" 
            className="h-32 w-auto mb-4"
          />
        </div>

        <nav className="space-y-2">
          <Link to="/dashboard">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/dashboard") && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/creators">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                isActive("/creators") && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              Creators
            </Button>
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
