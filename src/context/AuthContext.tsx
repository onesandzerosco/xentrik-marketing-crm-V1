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
    
    if (userData) {
      // If we have a user in localStorage, they're authenticated
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    } else {
      // Check for saved credentials if no active user session
      const savedCredentials = localStorage.getItem("savedCredentials");
      if (savedCredentials) {
        const { username, password } = JSON.parse(savedCredentials);
        // Auto login with saved credentials
        if (username === "admin" && password === "password") {
          const newUser = { username, emailVerified: false };
          localStorage.setItem("user", JSON.stringify(newUser));
          setUser(newUser);
          setIsAuthenticated(true);
        }
      }
    }
  }, []);

  const login = (username: string, password: string) => {
    // Dummy auth - in a real app, this would call an API
    if (username === "admin" && password === "password") {
      const newUser = { username, emailVerified: false };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
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
