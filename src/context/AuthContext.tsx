
import React, { createContext, useContext } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

interface AuthContextType {
  user: any;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  userRole: string;
  userRoles: string[];
  isCreator: boolean;
  isCreatorSelf: boolean;
  creatorId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user,
    isAuthenticated, 
    isLoading,
    userRole,
    userRoles,
    isCreator,
    creatorId,
    signInWithEmail,
    signInWithOAuth,
    signOut
  } = useSupabaseAuth();

  const isAdmin = userRole === 'Admin' || userRoles.includes('Admin');
  
  // Enhanced check for creator - check both primary role and additional roles
  const hasCreatorRole = userRole === 'Creator' || userRoles.includes('Creator');
  
  // Check if user is viewing their own creator profile
  const isCreatorSelf = hasCreatorRole && !!creatorId;

  const value = {
    user,
    isAdmin,
    isAuthenticated,
    isLoading,
    userRole,
    userRoles,
    isCreator: hasCreatorRole, // Use enhanced check
    isCreatorSelf,
    creatorId,
    signIn: signInWithEmail,
    signInWithGoogle: () => signInWithOAuth('google'),
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
