
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { Employee, EmployeeRole } from '@/types/employee';
import { useToast } from '@/hooks/use-toast';

// Interface for the context value
interface AuthContextType {
  user: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Additional methods for compatibility with existing code
  pendingUsers: any[];
  approvePendingUser: (id: string, approved: boolean) => void;
  createTeamMember: (username: string, email: string, role: EmployeeRole) => boolean;
  register: (username: string, email: string, password: string) => boolean;
  updateCredentials: (
    username: string, 
    currentPassword: string, 
    newPassword: string, 
    email: string, 
    emailVerified: boolean,
    displayName?: string,
    profileImage?: string
  ) => boolean;
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
  const { toast } = useToast();
  
  // Mock functionality for backwards compatibility
  const pendingUsers: any[] = [];
  
  const approvePendingUser = (id: string, approved: boolean) => {
    console.log('Approve pending user not implemented', id, approved);
  };
  
  const createTeamMember = (username: string, email: string, role: EmployeeRole) => {
    console.log('Create team member not implemented', username, email, role);
    return true;
  };
  
  // Register function for compatibility with Register.tsx
  const register = (username: string, email: string, password: string) => {
    // In the future, implement actual registration using Supabase
    console.log('Register not implemented', username, email);
    toast({
      title: "Registration functionality",
      description: "Registration is currently controlled through Supabase directly.",
    });
    return true;
  };
  
  // Update credentials function for compatibility with AccountSettings.tsx
  const updateCredentials = (
    username: string, 
    currentPassword: string, 
    newPassword: string, 
    email: string, 
    emailVerified: boolean,
    displayName?: string,
    profileImage?: string
  ) => {
    console.log('Update credentials not implemented', username, email, displayName);
    toast({
      title: "Profile update",
      description: "Profile updates are now handled through Supabase.",
    });
    return true;
  };
  
  // Map the Supabase auth to our Auth context format
  const authValue: AuthContextType = {
    user: supabaseAuth.userProfile ? {
      ...supabaseAuth.userProfile,
      username: supabaseAuth.userProfile.name, // Map name to username for compatibility
      displayName: supabaseAuth.userProfile.name, // Map name to displayName for compatibility
    } : null,
    isAuthenticated: supabaseAuth.isAuthenticated,
    isLoading: supabaseAuth.isLoading,
    signIn: supabaseAuth.signIn,
    signOut: supabaseAuth.signOut,
    pendingUsers,
    approvePendingUser,
    createTeamMember,
    register,
    updateCredentials,
  };
  
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
