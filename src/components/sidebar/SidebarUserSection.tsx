import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, ChevronDown } from 'lucide-react';

const SidebarUserSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user,
    signOut
  } = useSupabaseAuth();

  const handleLogout = () => {
    signOut();
  };

  const getUserInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  if (!user) return null;

  return <div className="px-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-full justify-start p-2 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-3 w-full min-w-0">
              <Avatar className="h-9 w-9 flex-shrink-0 border border-premium-accent1/30">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
                <AvatarFallback className="bg-premium-accent1/10">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex flex-col text-left min-w-0">
                <span className="font-medium text-sm truncate max-w-[120px] text-white">{user.email}</span>
                <span className="text-xs text-muted-foreground">User</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-premium-card border-premium-border shadow-premium-md">
          <DropdownMenuItem onClick={() => navigate('/account')} className="cursor-pointer hover:bg-gradient-premium-yellow hover:text-black">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-premium-border/20" />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="mr-2 h-4 w-4 text-red-600" />
            <span className="text-red-600">Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>;
};

export default SidebarUserSection;
