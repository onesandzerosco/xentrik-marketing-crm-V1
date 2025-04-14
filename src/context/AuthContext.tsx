
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { Employee, EmployeeRole } from '@/types/employee';

// Interface for the context value
interface AuthContextType {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // These are placeholders for backwards compatibility
  pendingUsers: any[];
  approvePendingUser: (id: string, approved: boolean) => void;
  createTeamMember: (username: string, email: string, role: EmployeeRole) => boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component (wrapper for SupabaseAuthProvider)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabaseAuth = useSupabaseAuth();
  
  // Mock functionality for backwards compatibility
  const pendingUsers: any[] = [];
  
  const approvePendingUser = (id: string, approved: boolean) => {
    console.log('Approve pending user not implemented', id, approved);
  };
  
  const createTeamMember = (username: string, email: string, role: EmployeeRole) => {
    console.log('Create team member not implemented', username, email, role);
    return true;
  };
  
  // Map the Supabase auth to our Auth context format
  const authValue: AuthContextType = {
    user: supabaseAuth.userProfile,
    isAuthenticated: supabaseAuth.isAuthenticated,
    isLoading: supabaseAuth.isLoading,
    signIn: supabaseAuth.signIn,
    signOut: supabaseAuth.signOut,
    pendingUsers,
    approvePendingUser,
    createTeamMember,
  };
  
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
