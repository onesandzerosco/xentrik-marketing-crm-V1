
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: Record<string, any> | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (
    username: string, 
    currentPassword: string, 
    newPassword?: string, 
    email?: string, 
    emailVerified?: boolean
  ) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
  updateCredentials: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const userData = localStorage.getItem("user");
    const signedOut = localStorage.getItem("explicitly_signed_out") === "true";
    
    if (userData && !signedOut) {
      // If we have a user in localStorage and they didn't explicitly sign out, they're authenticated
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    } else {
      // Check for saved credentials if no active user session and not explicitly signed out
      if (!signedOut) {
        const savedCredentials = localStorage.getItem("savedCredentials");
        if (savedCredentials) {
          const { username, password } = JSON.parse(savedCredentials);
          // Auto login with saved credentials
          if (username === "admin" && password === "password") {
            const newUser = { 
              id: "1", // Add an ID for the current user
              username, 
              emailVerified: false,
              role: "Admin" // Default the demo user to Admin role
            };
            localStorage.setItem("user", JSON.stringify(newUser));
            setUser(newUser);
            setIsAuthenticated(true);
          }
        }
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    // Dummy auth - in a real app, this would call an API
    if (username === "admin" && password === "password") {
      const newUser = { 
        id: "1", // Add an ID for the current user
        username, 
        emailVerified: false,
        role: "Admin" // Default the demo user to Admin role
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      // Clear the explicitly signed out flag when user logs in
      localStorage.removeItem("explicitly_signed_out");
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    // Set a flag to indicate user explicitly signed out
    localStorage.setItem("explicitly_signed_out", "true");
    setUser(null);
    // Keep saved credentials in localStorage when logging out
    setIsAuthenticated(false);
  };

  const updateCredentials = (
    username: string, 
    currentPassword: string, 
    newPassword?: string, 
    email?: string, 
    emailVerified?: boolean
  ) => {
    // Verify current password
    if (currentPassword !== "password") {
      return false;
    }

    // Get current user data
    const userData = JSON.parse(localStorage.getItem("user") || '{}');
    
    // Update user data
    const updatedUserData = {
      ...userData,
      username,
      email: email || userData.email,
      emailVerified: emailVerified !== undefined ? emailVerified : userData.emailVerified
    };

    // Update in localStorage
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    setUser(updatedUserData);

    // Update saved credentials if remember me was enabled
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      const updatedCredentials = {
        ...credentials,
        username,
        password: newPassword || credentials.password
      };
      localStorage.setItem("savedCredentials", JSON.stringify(updatedCredentials));
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};
