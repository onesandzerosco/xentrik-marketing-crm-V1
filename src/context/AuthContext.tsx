
import React from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

// This file re-exports Supabase auth functionality 
// to maintain compatibility with existing components

// Mock interface for pending users (previously from Auth0)
export interface PendingUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// AuthContext types
export interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  pendingUsers: PendingUser[];
  approvePendingUser: (id: string, approved: boolean) => void;
  createTeamMember: (username: string, email: string, role: string) => boolean;
  updateCredentials: (
    username: string,
    currentPassword: string,
    newPassword: string,
    email: string,
    emailVerified: boolean,
    displayName: string,
    profileImage: string
  ) => boolean;
  isCreator: boolean;
  creatorId: string | null;
  userRole: string;
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
  
  // Mock empty pending users array (since we're using Supabase now)
  const pendingUsers: PendingUser[] = [];
  
  // Mock functions for compatibility
  const approvePendingUser = (id: string, approved: boolean) => {
    console.log('Approve pending user is not implemented with Supabase');
  };
  
  const createTeamMember = (username: string, email: string, role: string) => {
    console.log('Create team member function is not implemented with Supabase');
    return true;
  };
  
  const updateCredentials = (
    username: string,
    currentPassword: string,
    newPassword: string,
    email: string,
    emailVerified: boolean,
    displayName: string,
    profileImage: string
  ) => {
    console.log('Update credentials is not implemented with Supabase');
    return true;
  };
  
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
    pendingUsers,
    approvePendingUser,
    createTeamMember,
    updateCredentials,
    isCreator: supabaseAuth.isCreator,
    creatorId: supabaseAuth.creatorId,
    userRole: supabaseAuth.userRole,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
