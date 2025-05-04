
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
  Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  roles?: string[]; // Specific roles that can access this item
  allowCreator?: boolean; // Allow Creator role to access this item
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
    roles: ['Admin', 'VA', 'Chatter'], // Only these roles can see Creators
    allowCreator: true, // Allow Creator to see their own profile
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
    path: '/messages',
    label: 'Messages',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    path: '/shared-files',
    label: 'Shared Files',
    icon: <FileUp className="h-5 w-5" />,
  },
  {
    path: '/voice-generation',
    label: 'Voice Generator',
    icon: <Mic className="h-5 w-5" />,
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
        // Skip adminOnly items if user is not admin
        if (item.adminOnly && !isAdmin) return null;
        
        // Check if the item has role restrictions
        if (item.roles) {
          // Check if user has at least one of the required roles
          const hasRequiredRole = item.roles.some(role => 
            userRole === role || (userRoles && userRoles.includes(role))
          );
          
          // Special case: if allowCreator is true, creators can see this item even without the specified roles
          const creatorAccess = item.allowCreator && isCreator;
          
          // Skip if user doesn't have any required role and is not a creator with special access
          if (!hasRequiredRole && !creatorAccess) return null;
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
