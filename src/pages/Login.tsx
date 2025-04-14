
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const logoUrl = "/lovable-uploads/20bc55f1-9a4b-4fc9-acf0-bfef2843d250.png";
const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const img = preloadImage(logoUrl);
    img.onload = () => setLogoLoaded(true);
    
    if (img.complete) {
      setLogoLoaded(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    setIsLoading(true);
    loginWithRedirect();
  };

  if (isAuthenticated) {
    return null;
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center pt-6">
              <Skeleton className="h-44 w-full mx-auto" />
            </div>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center pt-6">
            {!logoLoaded && (
              <div className="h-44 w-auto mx-auto bg-muted/20 animate-pulse rounded"></div>
            )}
            <img 
              src={logoUrl}
              alt="XENTRIK MARKETING" 
              className={cn(
                "h-44 mx-auto transition-opacity duration-300",
                logoLoaded ? "opacity-100" : "opacity-0"
              )}
              style={{ willChange: "transform" }}
            />
          </div>
          <CardHeader>
            <CardTitle>Secure Sign In</CardTitle>
            <CardDescription>
              Securely access your account with Auth0 authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleLogin}
              className="w-full bg-brand-yellow text-black hover:bg-brand-highlight"
              disabled={isLoading}
            >
              {isLoading ? "Redirecting to Auth0..." : "Sign In Securely"}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center flex-col">
            <p className="text-sm text-muted-foreground">
              This system uses enterprise-grade authentication with Auth0
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
