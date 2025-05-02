
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupabaseAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  isCreator: boolean;
  creatorId: string | null;
  userRole: string;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: 'google') => Promise<void>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | null>(null);

export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState('Employee');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to check creator status
  const checkCreatorStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('creator_team_members')
        .select('creator_id')
        .eq('team_member_id', userId)
        .limit(1);
        
      if (data && data.length > 0) {
        setIsCreator(true);
        setCreatorId(data[0].creator_id);
        localStorage.setItem('isCreator', 'true');
        localStorage.setItem('creatorId', data[0].creator_id);
      } else {
        setIsCreator(false);
        setCreatorId(null);
        localStorage.removeItem('isCreator');
        localStorage.removeItem('creatorId');
      }
      
      // Also fetch user role
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (profileData) {
        setUserRole(profileData.role);
        localStorage.setItem('userRole', profileData.role);
      }
    } catch (error) {
      console.error('Error checking creator status:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setIsAuthenticated(!!currentSession);
      setUser(currentSession?.user ?? null);
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Check creator status when session changes
        const storedIsCreator = localStorage.getItem('isCreator');
        const storedCreatorId = localStorage.getItem('creatorId');
        const storedUserRole = localStorage.getItem('userRole');
        
        if (storedIsCreator === 'true' && storedCreatorId) {
          setIsCreator(true);
          setCreatorId(storedCreatorId);
        } else {
          // If not in localStorage, fetch it
          checkCreatorStatus(currentSession.user.id);
        }
        
        if (storedUserRole) {
          setUserRole(storedUserRole);
        }
      }
      
      setIsLoading(false);
      
      if (event === 'SIGNED_OUT') {
        navigate('/login');
        // Clear stored values on sign out
        localStorage.removeItem('isCreator');
        localStorage.removeItem('creatorId');
        localStorage.removeItem('userRole');
        setIsCreator(false);
        setCreatorId(null);
        setUserRole('Employee');
      } else if (event === 'SIGNED_IN') {
        // Check for a stored route in localStorage
        const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');
        // Navigate to the last visited route or default to dashboard
        navigate(lastVisitedRoute || '/dashboard');
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setIsAuthenticated(!!currentSession);
      setUser(currentSession?.user ?? null);
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Check creator status for existing session
        checkCreatorStatus(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out",
      });
      navigate('/login');
      
      // Clear stored values
      localStorage.removeItem('isCreator');
      localStorage.removeItem('creatorId');
      localStorage.removeItem('userRole');
      setIsCreator(false);
      setCreatorId(null);
      setUserRole('Employee');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message,
      });
    }
  };

  return (
    <SupabaseAuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        session,
        isCreator,
        creatorId,
        userRole,
        signInWithEmail,
        signInWithOAuth,
        signOut
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};
