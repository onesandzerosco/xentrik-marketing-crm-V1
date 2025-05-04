
import React from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

// This file re-exports Supabase auth functionality 
// to maintain compatibility with existing components

// AuthContext types
export interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isCreator: boolean;
  creatorId: string | null;
  userRole: string;
  userRoles: string[];
  isCreatorSelf: boolean; // Property to check if user is viewing their own creator profile
  updateCredentials?: (credentials: { email?: string; password?: string }) => Promise<void>;
  pendingUsers?: any[];
  approvePendingUser?: (userId: string, approved: boolean) => Promise<void>;
  createTeamMember?: (data: any) => Promise<void>;
}

// Create an AuthContext for compatibility
export const AuthContext = React.createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Compatible Auth Provider that wraps SupabaseAuth
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseAuth = useSupabaseAuth();
  
  // Determine if the user is viewing their own creator profile
  // This is true when the user is authenticated as a creator and their creatorId matches their userId
  const isCreatorSelf = supabaseAuth.isAuthenticated && 
                        supabaseAuth.isCreator && 
                        supabaseAuth.creatorId === supabaseAuth.user?.id;
  
  // Create a compatible auth context value
  const authContextValue: AuthContextType = {
    user: {
      ...supabaseAuth.user,
      role: supabaseAuth.user?.user_metadata?.role || supabaseAuth.userRole || 'Employee',
      id: supabaseAuth.user?.id,
      email: supabaseAuth.user?.email,
      username: supabaseAuth.user?.email,
      displayName: supabaseAuth.user?.user_metadata?.name,
      profileImage: supabaseAuth.user?.user_metadata?.avatar_url,
    },
    isAuthenticated: supabaseAuth.isAuthenticated,
    isLoading: supabaseAuth.isLoading,
    signOut: supabaseAuth.signOut,
    isCreator: supabaseAuth.isCreator,
    creatorId: supabaseAuth.creatorId,
    userRole: supabaseAuth.userRole,
    userRoles: supabaseAuth.userRoles,
    isCreatorSelf, // Add the new property to the context
    updateCredentials: supabaseAuth.updateCredentials,
    pendingUsers: supabaseAuth.pendingUsers || [],
    approvePendingUser: supabaseAuth.approvePendingUser,
    createTeamMember: supabaseAuth.createTeamMember,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
