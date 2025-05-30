
import React, { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  UserPlus,
  Database,
  Folder,
  Image,
  Video,
  LucideIcon
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  section?: string;
}

const SidebarNav = ({ isAdmin }: { isAdmin: boolean }) => {
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Creators",
      url: "/creators",
      icon: Users,
    },
    {
      title: "Content Calendar",
      url: "/calendar",
      icon: Calendar,
    },
    {
      title: "Files",
      url: "/files",
      icon: FileText,
    },
    ...(isAdmin ? [
      {
        title: "Creator Onboard Queue",
        url: "/onboard-queue",
        icon: UserPlus,
        section: "admin"
      },
    ] : []),
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navigationItems.map((item) => (
        <NavLink
          key={item.title}
          to={item.url}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-accent-foreground ${
              isActive
                ? "bg-secondary text-accent-foreground"
                : "text-muted-foreground"
            }`
          }
        >
          <item.icon className="h-4 w-4" />
          {item.title}
        </NavLink>
      ))}
      
      {/* Creators Data - Available for Admin, VA, and Chatter roles */}
      <NavLink
        to="/creators-data"
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-accent-foreground ${
            isActive
              ? "bg-secondary text-accent-foreground"
              : "text-muted-foreground"
          }`
        }
      >
        <Database className="h-4 w-4" />
        Creators Data
      </NavLink>
    </nav>
  );
};

export default SidebarNav;
