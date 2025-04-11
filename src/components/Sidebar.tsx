
import React, { useEffect, useState } from "react";
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
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Preload the logo image
const logoUrl = "/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png";
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { logout, user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [logoLoaded, setLogoLoaded] = useState(false);

  // Preload the logo image when component mounts
  useEffect(() => {
    const img = preloadImage(logoUrl);
    img.onload = () => setLogoLoaded(true);
    
    // If the image is already cached, it might be loaded immediately
    if (img.complete) {
      setLogoLoaded(true);
    }
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  if (isMobile) {
    return null;
  }

  return (
    <div className="fixed h-screen w-60 premium-sidebar">
      <div className="flex h-20 items-center justify-center pt-5 pb-2">
        {/* Use inline SVG as a placeholder while image loads */}
        {!logoLoaded && (
          <div className="h-[67.5px] w-auto bg-premium-dark/20 animate-pulse rounded"></div>
        )}
        <img
          src={logoUrl}
          alt="Xentrik Marketing"
          className={cn(
            "h-[67.5px] w-auto object-contain transition-opacity duration-300",
            logoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{ willChange: "transform" }} // Add will-change to optimize rendering
        />
      </div>
      
      <div className="border-t border-premium-border mt-3 mb-5"></div>

      <div className="flex flex-col h-[calc(100vh-5rem-2rem)] justify-between p-3">
        <nav className="grid gap-1 px-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
              )
            }
          >
            <UserCog className="h-5 w-5" />
            <span>Team</span>
          </NavLink>
          
          <NavLink
            to="/secure-logins"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
              )
            }
          >
            <Lock className="h-5 w-5" />
            <span>Secure Logins</span>
          </NavLink>
          
          {isAdmin && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                  isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-brand-yellow hover:text-black",
                isActive ? "bg-brand-yellow text-black" : "hover:bg-brand-yellow hover:text-black"
              )
            }
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messages</span>
          </NavLink>
        </nav>

        <div className="mt-auto grid gap-1 px-2">
          {user && (
            <div className="border-t border-premium-border pt-4 mb-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2 hover:bg-brand-yellow hover:text-black">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-9 w-9 border border-premium-accent1/50">
                        <AvatarImage src={user.profileImage} alt={user.username} />
                        <AvatarFallback className="bg-premium-accent1/20">{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col text-left">
                        <span className="font-medium text-sm">{user.username}</span>
                        <span className="text-xs text-muted-foreground">{user.role}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-premium-card border border-premium-border shadow-premium-md">
                  <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer hover:bg-brand-yellow hover:text-black">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-premium-border" />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-[#ea384c] hover:text-[#ea384c] hover:bg-premium-highlight/30"
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
