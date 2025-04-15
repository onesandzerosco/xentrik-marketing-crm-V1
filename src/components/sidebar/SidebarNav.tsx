
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UserCog, 
  Lock 
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

interface SidebarNavProps {
  isAdmin: boolean;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    path: '/creators',
    label: 'Creators',
    icon: <Users className="h-5 w-5" />,
  },
  {
    path: '/team',
    label: 'Team',
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    path: '/secure-logins',
    label: 'Secure Logins',
    icon: <Lock className="h-5 w-5" />,
  },
  {
    path: '/users',
    label: 'User Management',
    icon: <Users className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ isAdmin }) => {
  return (
    <nav className="grid gap-1 pt-[60px] z-30 relative">
      {navItems.map((item) => {
        if (item.adminOnly && !isAdmin) return null;
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300",
                "hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5 hover:shadow-premium-yellow",
                "active:translate-y-0 active:opacity-90",
                isActive ? "bg-gradient-premium-yellow text-black shadow-premium-yellow" : ""
              )
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default SidebarNav;
