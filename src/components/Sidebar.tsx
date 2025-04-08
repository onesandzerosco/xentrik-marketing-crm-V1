
import React from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  UserCog,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  // Helper function to get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  // Don't render the sidebar in mobile view
  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed h-screen w-60 border-r bg-background">
      <div className="flex h-20 items-center justify-center border-b">
        <img
          src="/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png"
          alt="Xentrik Marketing"
          className="h-[70px] w-auto object-contain"
        />
      </div>

      <div className="flex flex-col h-[calc(100vh-5rem)] justify-between p-3">
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
          {/* User profile dropdown section */}
          {user && (
            <div className="border-t pt-4 mb-2">
              <DropdownMenu onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 hover:bg-accent">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col text-left">
                        <span className="font-medium text-sm">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.role}</span>
                      </div>
                      {dropdownOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-[#ea384c] hover:text-[#ea384c] focus:text-[#ea384c]"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
