
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Auth0ContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  loginWithRedirect: () => void;
  logout: () => void;
  getAccessTokenSilently: () => Promise<string>;
}

const Auth0Context = createContext<Auth0ContextType | null>(null);

export const useAuth0Context = () => {
  const context = useContext(Auth0Context);
  if (!context) {
    throw new Error('useAuth0Context must be used within an Auth0Provider');
  }
  return context;
};

export const Auth0ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle auth state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User authenticated:', user);
      // Set last login timestamp
      localStorage.setItem('last_login', new Date().toISOString());
      
      // You could store non-sensitive user preferences here
      // But NO sensitive information
    }
  }, [isAuthenticated, user]);

  // Custom logout function that redirects to login page
  const logout = () => {
    auth0Logout({ 
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
    // Clear any non-sensitive app state
    localStorage.removeItem('last_login');
    toast({
      title: "Logged out successfully",
      description: "You have been securely logged out",
    });
  };

  return (
    <Auth0Context.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        loginWithRedirect,
        logout,
        getAccessTokenSilently
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
};
