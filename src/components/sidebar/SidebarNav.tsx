
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  UserCog, 
  Lock,
  FileUp,
  Mic,
  Shield,
  UserPlus,
  ListCheck,
  Database
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  roles?: string[]; // Specific roles that can access this item
  allowCreator?: boolean; // Allow Creator role to access this item
  hideForCreator?: boolean; // Hide this item for Creator role
  hidden?: boolean; // Hide this item completely
}

interface SidebarNavProps {
  isAdmin: boolean;
}

const navItems: NavItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    allowCreator: true, // Explicitly allow Creators to see Dashboard
  },
  {
    path: '/creators',
    label: 'Creators',
    icon: <Users className="h-5 w-5" />,
    hideForCreator: true, // Hide for Creator role
  },
  {
    path: '/creators-data',
    label: 'Model Profile',
    icon: <Database className="h-5 w-5" />,
    roles: ['Admin', 'VA', 'Chatter'], // Only these roles can see this
  },
  {
    path: '/shared-files',
    label: 'Shared Files',
    icon: <FileUp className="h-5 w-5" />,
    allowCreator: true, // Explicitly allow Creators to see Shared Files
  },
  {
    path: '/team',
    label: 'Team',
    icon: <UserCog className="h-5 w-5" />,
    hideForCreator: true, // Hide for Creator role
  },
  {
    path: '/secure-logins',
    label: 'Secure Logins',
    icon: <Lock className="h-5 w-5" />,
    allowCreator: true, // Allow Creator role to access their own secure logins
  },
  {
    path: '/messages',
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
    hideForCreator: true, // Hide for Creator role
  },
  {
    path: '/voice-generation',
    label: 'Voice Generator',
    icon: <Mic className="h-5 w-5" />,
    hideForCreator: true, // Hide for Creator role
  },
  {
    path: '/onboard',
    label: 'Creator Onboarding',
    icon: <UserPlus className="h-5 w-5" />,
    hidden: true, // Hide from all users - only accessible via direct links
  },
  {
    path: '/onboard-queue',
    label: 'Onboard Queue',
    icon: <ListCheck className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    path: '/access-control',
    label: 'Access Control',
    icon: <Shield className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    path: '/users',
    label: 'User Management',
    icon: <Users className="h-5 w-5" />,
    adminOnly: true,
  },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ isAdmin }) => {
  const { userRole, userRoles, isCreator } = useAuth();
  
  return (
    <nav className="grid gap-1 pt-2 z-30 relative">
      {navItems.map((item) => {
        // Skip items that are completely hidden
        if (item.hidden) return null;
        
        // Skip adminOnly items if user is not admin
        if (item.adminOnly && !isAdmin) return null;
        
        // For Creator role users, only show items that explicitly allow Creator
        if (isCreator && userRole === 'Creator') {
          if (!item.allowCreator) return null;
        }
        
        // Skip items that should be hidden for creators if the user is a creator
        if (item.hideForCreator && isCreator) return null;
        
        // Check specific roles if defined
        if (item.roles) {
          const hasRequiredRole = item.roles.some(role => 
            userRole === role || (userRoles && userRoles.includes(role))
          );
          if (!hasRequiredRole) return null;
        }
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300",
                {
                  "bg-gradient-premium-yellow text-black": isActive,
                  "hover:bg-gradient-premium-yellow hover:text-black hover:-translate-y-0.5": !isActive
                }
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
