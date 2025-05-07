
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseAuthContextType } from './types';
import { useAuthActions } from './useAuthActions';
import { checkCreatorStatus, getStoredAuthValues, clearStoredAuthValues } from './authUtils';

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
  const authActions = useAuthActions();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setIsAuthenticated(!!currentSession);
      setUser(currentSession?.user ?? null);
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Check creator status when session changes
        const { isCreator: storedIsCreator, creatorId: storedCreatorId, 
                userRole: storedUserRole, userRoles: storedUserRoles } = getStoredAuthValues();
        
        if (storedIsCreator) {
          setIsCreator(true);
        }
        
        if (storedCreatorId) {
          setCreatorId(storedCreatorId);
        }
        
        if (storedUserRole) {
          setUserRole(storedUserRole);
        }
        
        if (storedUserRoles.length > 0) {
          setUserRoles(storedUserRoles);
        }
        
        // Always check for updated status
        setTimeout(() => {
          checkCreatorStatus(currentSession.user.id).then(({
            isCreator: hasCreatorRole,
            creatorId: userCreatorId,
            userRole: role,
            userRoles: roles
          }) => {
            setIsCreator(hasCreatorRole);
            setCreatorId(userCreatorId);
            setUserRole(role);
            setUserRoles(roles);
          });
        }, 0);
      }
      
      setIsLoading(false);
      
      if (event === 'SIGNED_OUT') {
        navigate('/login');
        // Clear stored values on sign out
        clearStoredAuthValues();
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
        setTimeout(() => {
          checkCreatorStatus(currentSession.user.id).then(({
            isCreator: hasCreatorRole,
            creatorId: userCreatorId,
            userRole: role,
            userRoles: roles
          }) => {
            setIsCreator(hasCreatorRole);
            setCreatorId(userCreatorId);
            setUserRole(role);
            setUserRoles(roles);
          });
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
        ...authActions
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  );
};
