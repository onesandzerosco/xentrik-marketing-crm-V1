
import React from "react";
import { 
  Home, 
  FileText, 
  AlertOctagon, 
  MessageSquare, 
  Settings, 
  LogOut,
  User,
  Users,
  Video
} from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StorageUsage } from "./storage/StorageUsage";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const menuItems = [
    { icon: <Home />, label: "Dashboard", path: "/dashboard" },
    { icon: <Video />, label: "Creators", path: "/creators" },
    { icon: <Users />, label: "Team", path: "/team" },
    { icon: <AlertOctagon />, label: "Content Moderation", path: "#" },
    { icon: <FileText />, label: "Reports", path: "#" },
    { icon: <MessageSquare />, label: "Messages", path: "#" },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-card border-r flex flex-col">
      <div className="p-0 border-b flex items-center justify-center">
        <Link to="/dashboard" className="py-2 flex justify-center">
          <img 
            src="/lovable-uploads/c79203dc-0401-40c1-bf4a-821b26aa6031.png" 
            alt="Xentrik Marketing" 
            className="h-20" 
          />
        </Link>
      </div>

      <nav className="p-4 flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.label} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-md hover:bg-accent hover:text-accent-foreground ${
                  isActive(item.path) ? 'bg-accent text-accent-foreground' : ''
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start pl-2 space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium leading-none">{user?.username || 'Guest'}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || 'No email set'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem onClick={() => navigate('/account')}>
              <Settings className="h-4 w-4 mr-2" />
              <span>Account Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <StorageUsage />
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
