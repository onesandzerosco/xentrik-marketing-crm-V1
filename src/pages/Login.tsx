
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load page with a slight delay to ensure all elements are rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 500); // 500ms delay to ensure complete loading
    
    return () => clearTimeout(timer);
  }, []);

  // Check if user is already authenticated, redirect to dashboard if they are
  useEffect(() => {
    if (isAuthenticated && isPageLoaded) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, isPageLoaded]);

  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      setUsername(credentials.username);
      setPassword(credentials.password);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const success = login(username, password);
      
      if (success) {
        if (rememberMe) {
          localStorage.setItem("savedCredentials", JSON.stringify({ username, password }));
        } else {
          localStorage.removeItem("savedCredentials");
        }
        
        toast({
          title: "Login successful",
          description: "Welcome to the bananaverse 🍌",
          duration: 6000, // 6 seconds
        });
        
        // Add a slight delay before navigation to ensure all elements are loaded
        setTimeout(() => {
          navigate("/dashboard");
        }, 400);
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Invalid username or password",
        });
      }
      
      setIsLoading(false);
    }, 1500); // Increased from 1000ms to 1500ms to give more time for elements to load
  };

  // If already authenticated and page is loaded, don't render the login form
  if (isAuthenticated && isPageLoaded) {
    return null;
  }

  // If page is not yet loaded, show a minimal loading state
  if (!isPageLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-44 w-44 mx-auto mb-4 bg-muted rounded"></div>
            <div className="h-8 w-32 mx-auto bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center pt-6">
            <img 
              src="/lovable-uploads/20bc55f1-9a4b-4fc9-acf0-bfef2843d250.png" 
              alt="XENTRIK MARKETING" 
              className="h-44 mx-auto"
            />
          </div>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-xs"
                    type="button"
                  >
                    Forgot Password?
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute inset-y-0 right-0 flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="rememberMe" 
                  checked={rememberMe} 
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="rememberMe"
                  className="text-sm font-normal cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand text-black hover:bg-brand/80"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              For demo purposes, use: admin / password
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
