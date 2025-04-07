import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated on mount
    const user = localStorage.getItem("user");
    
    // Check for saved credentials if no active user session
    if (!user) {
      const savedCredentials = localStorage.getItem("savedCredentials");
      if (savedCredentials) {
        const { username, password } = JSON.parse(savedCredentials);
        // Auto login with saved credentials
        if (username === "admin" && password === "password") {
          localStorage.setItem("user", JSON.stringify({ username }));
          setIsAuthenticated(true);
        }
      }
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string) => {
    // Dummy auth - in a real app, this would call an API
    if (username === "admin" && password === "password") {
      localStorage.setItem("user", JSON.stringify({ username }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("user");
    // Keep saved credentials in localStorage when logging out
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
