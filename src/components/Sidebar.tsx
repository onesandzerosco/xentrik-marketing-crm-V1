
import React from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "Admin";

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  // Don't render the sidebar in mobile view
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed h-screen w-60 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <img
          src="/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png"
          alt="Xentrik Marketing"
          className="h-[30px] w-auto object-contain"
        />
      </div>

      <div className="flex flex-col h-[calc(100vh-3.5rem)] justify-between p-2">
        <nav className="grid gap-1 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/creators"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <Users className="h-5 w-5" />
            <span>Creators</span>
          </NavLink>

          <NavLink
            to="/team"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <UserCog className="h-5 w-5" />
            <span>Team</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                  isActive && "bg-accent text-accent-foreground"
                )
              }
            >
              <Users className="h-5 w-5" />
              <span>User Management</span>
            </NavLink>
          )}

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </NavLink>
        </nav>

        <div className="mt-auto grid gap-1 px-2">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                isActive && "bg-accent text-accent-foreground"
              )
            }
          >
            <Settings className="h-5 w-5" />
            <span>Account</span>
          </NavLink>

          <Button
            variant="ghost"
            className="flex justify-start gap-3 px-3 text-muted-foreground transition-all hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
          
          <div className="py-2 flex items-center px-3">
            <ModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
