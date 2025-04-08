
import React, { createContext, useContext, useState, useEffect } from "react";
import { EmployeeRole } from "../types/employee";
import { useToast } from "@/hooks/use-toast";

// Enhanced user type with additional fields
interface User {
  id: string;
  username: string;
  email?: string;
  emailVerified: boolean;
  role: EmployeeRole;
  approved: boolean;
  createdAt: string;
}

interface PendingUser {
  id: string;
  username: string;
  email: string;
  role: EmployeeRole;
  createdAt: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  pendingUsers: PendingUser[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, email: string, password: string) => boolean;
  updateCredentials: (
    username: string, 
    currentPassword: string, 
    newPassword?: string, 
    email?: string, 
    emailVerified?: boolean
  ) => boolean;
  approvePendingUser: (userId: string, approved: boolean) => void;
  createTeamMember: (username: string, email: string, role: EmployeeRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  pendingUsers: [],
  login: () => false,
  logout: () => {},
  register: () => false,
  updateCredentials: () => false,
  approvePendingUser: () => {},
  createTeamMember: () => false,
});

export const useAuth = () => useContext(AuthContext);

// Initial admin accounts - in a real app, this would come from a database
const initialAdmins = [
  {
    id: "1",
    username: "admin",
    password: "password",
    email: "admin@example.com",
    emailVerified: true,
    role: "Admin" as EmployeeRole,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: "2",
    username: "admin2",
    password: "password2",
    email: "admin2@example.com",
    emailVerified: true,
    role: "Admin" as EmployeeRole,
    approved: true,
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<Array<User & { password: string }>>(() => {
    const savedUsers = localStorage.getItem("auth_users");
    return savedUsers ? JSON.parse(savedUsers) : initialAdmins;
  });
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(() => {
    const savedPendingUsers = localStorage.getItem("pending_users");
    return savedPendingUsers ? JSON.parse(savedPendingUsers) : [];
  });

  const { toast } = useToast();

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("auth_users", JSON.stringify(users));
  }, [users]);

  // Save pending users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pending_users", JSON.stringify(pendingUsers));
  }, [pendingUsers]);

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
          const foundUser = users.find(u => u.username === username && u.password === password && u.approved);
          if (foundUser) {
            const userWithoutPassword = {
              id: foundUser.id,
              username: foundUser.username,
              email: foundUser.email,
              emailVerified: foundUser.emailVerified,
              role: foundUser.role,
              approved: foundUser.approved,
              createdAt: foundUser.createdAt
            };
            localStorage.setItem("user", JSON.stringify(userWithoutPassword));
            setUser(userWithoutPassword);
            setIsAuthenticated(true);
          }
        }
      }
    }
  }, [users]);

  const login = (username: string, password: string) => {
    // Find user with matching credentials
    const foundUser = users.find(u => u.username === username && u.password === password && u.approved);
    
    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        emailVerified: foundUser.emailVerified,
        role: foundUser.role,
        approved: foundUser.approved,
        createdAt: foundUser.createdAt
      };
      
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      // Clear the explicitly signed out flag when user logs in
      localStorage.removeItem("explicitly_signed_out");
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      // Update last login time in users array
      setUsers(users.map(u => 
        u.id === foundUser.id 
          ? { ...u, lastLogin: new Date().toISOString() } 
          : u
      ));
      
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

  const register = (username: string, email: string, password: string) => {
    // Check if username or email already exists
    if (users.some(u => u.username === username) || 
        users.some(u => u.email === email) ||
        pendingUsers.some(u => u.username === username) ||
        pendingUsers.some(u => u.email === email)) {
      return false;
    }

    // Create pending user
    const newPendingUser: PendingUser = {
      id: Date.now().toString(),
      username,
      email,
      role: "Employee", // Default role
      createdAt: new Date().toISOString()
    };

    // Add to pending users
    setPendingUsers([...pendingUsers, newPendingUser]);
    
    // Add to users with unapproved status and password
    const newUser = {
      ...newPendingUser,
      password,
      emailVerified: false,
      approved: false
    };
    setUsers([...users, newUser]);

    toast({
      title: "Registration Successful",
      description: "Your account is pending approval by an admin",
    });
    
    return true;
  };

  const approvePendingUser = (userId: string, approved: boolean) => {
    if (approved) {
      // Update the user's approved status
      setUsers(users.map(u => 
        u.id === userId ? { ...u, approved: true } : u
      ));
      
      // Remove from pending users
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      toast({
        title: "User Approved",
        description: "The user can now login to the system",
      });
    } else {
      // Reject the user
      setUsers(users.filter(u => u.id !== userId));
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
      
      toast({
        title: "User Rejected",
        description: "The user request has been rejected",
      });
    }
  };

  const createTeamMember = (username: string, email: string, role: EmployeeRole) => {
    // Check if username or email already exists
    if (users.some(u => u.username === username) || users.some(u => u.email === email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Username or email already exists",
      });
      return false;
    }

    // Create new team member with a default password
    const defaultPassword = "changeMe123";
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: defaultPassword,
      emailVerified: false,
      role,
      approved: true, // Auto-approved since created by admin
      createdAt: new Date().toISOString()
    };

    setUsers([...users, newUser]);
    
    toast({
      title: "Team Member Created",
      description: `${username} has been added with role: ${role}. Default password: ${defaultPassword}`,
    });
    
    return true;
  };

  const updateCredentials = (
    username: string, 
    currentPassword: string, 
    newPassword?: string, 
    email?: string, 
    emailVerified?: boolean
  ) => {
    // Find the current user
    const currentUser = users.find(u => u.id === user?.id);
    
    if (!currentUser || currentUser.password !== currentPassword) {
      return false;
    }

    // Update user data
    const updatedUsers = users.map(u => {
      if (u.id === user?.id) {
        return {
          ...u,
          username,
          password: newPassword || u.password,
          email: email || u.email,
          emailVerified: emailVerified !== undefined ? emailVerified : u.emailVerified
        };
      }
      return u;
    });
    
    setUsers(updatedUsers);
    
    // Update current user
    if (user) {
      const updatedUser = {
        ...user,
        username,
        email: email || user.email,
        emailVerified: emailVerified !== undefined ? emailVerified : user.emailVerified
      };
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    // Update saved credentials if remember me was enabled
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      if (credentials.username === currentUser.username) {
        const updatedCredentials = {
          ...credentials,
          username,
          password: newPassword || credentials.password
        };
        localStorage.setItem("savedCredentials", JSON.stringify(updatedCredentials));
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      pendingUsers,
      login, 
      logout, 
      register,
      updateCredentials,
      approvePendingUser,
      createTeamMember
    }}>
      {children}
    </AuthContext.Provider>
  );
};
