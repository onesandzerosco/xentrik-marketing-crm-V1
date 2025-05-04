
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
  userRoles: string[];
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
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Helper function to check creator status
  const checkCreatorStatus = async (userId: string) => {
    try {
      // First check if user has Creator role in profiles.roles
      const { data: profileData } = await supabase
        .from('profiles')
        .select('roles, role')
        .eq('id', userId)
        .single();
        
      let hasCreatorRole = false;
      
      if (profileData?.roles && Array.isArray(profileData.roles) && profileData.roles.includes('Creator')) {
        hasCreatorRole = true;
        setIsCreator(true);
        localStorage.setItem('isCreator', 'true');
        setUserRoles(profileData.roles);
        localStorage.setItem('userRoles', JSON.stringify(profileData.roles));
      }
      
      if (profileData?.role) {
        setUserRole(profileData.role);
        localStorage.setItem('userRole', profileData.role);
      }
      
      // Also check creator_team_members for associations
      const { data } = await supabase
        .from('creator_team_members')
        .select('creator_id')
        .eq('team_member_id', userId)
        .limit(1);
        
      if (data && data.length > 0) {
        setCreatorId(data[0].creator_id);
        localStorage.setItem('creatorId', data[0].creator_id);
        
        // If user is directly associated with a creator, mark them as a creator
        if (!hasCreatorRole) {
          setIsCreator(true);
          localStorage.setItem('isCreator', 'true');
        }
      } else {
        // Only reset these if user isn't a creator by role
        if (!hasCreatorRole) {
          setIsCreator(false);
          setCreatorId(null);
          localStorage.removeItem('isCreator');
          localStorage.removeItem('creatorId');
        }
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
        const storedUserRoles = localStorage.getItem('userRoles');
        
        if (storedIsCreator === 'true') {
          setIsCreator(true);
        }
        
        if (storedCreatorId) {
          setCreatorId(storedCreatorId);
        }
        
        if (storedUserRole) {
          setUserRole(storedUserRole);
        }
        
        if (storedUserRoles) {
          try {
            const parsedRoles = JSON.parse(storedUserRoles);
            if (Array.isArray(parsedRoles)) {
              setUserRoles(parsedRoles);
            }
          } catch (e) {
            console.error('Error parsing stored user roles:', e);
            setUserRoles([]);
          }
        }
        
        // Always check for updated status
        checkCreatorStatus(currentSession.user.id);
      }
      
      setIsLoading(false);
      
      if (event === 'SIGNED_OUT') {
        navigate('/login');
        // Clear stored values on sign out
        localStorage.removeItem('isCreator');
        localStorage.removeItem('creatorId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userRoles');
        setIsCreator(false);
        setCreatorId(null);
        setUserRole('Employee');
        setUserRoles([]);
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
      localStorage.removeItem('userRoles');
      setIsCreator(false);
      setCreatorId(null);
      setUserRole('Employee');
      setUserRoles([]);
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
        userRoles,
        signInWithEmail,
        signInWithOAuth,
        signOut
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};
