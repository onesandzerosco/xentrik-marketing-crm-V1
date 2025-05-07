
import { Session, User } from '@supabase/supabase-js';

export interface SupabaseAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  isCreator: boolean;
  creatorId: string | null;
  userRole: string;
  userRoles: string[];
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
  updateCredentials: (credentials: { 
    email?: string; 
    password?: string;
    currentPassword?: string;
    displayName?: string;
    profileImage?: string;
  }) => Promise<boolean>;
  pendingUsers?: any[];
  approvePendingUser?: (userId: string, approved: boolean) => Promise<void>;
  createTeamMember: (data: { 
    username: string; 
    email: string; 
    role: string;
  }) => Promise<boolean>;
}
