
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import AuthFormHeader from './auth/AuthFormHeader';
import PasswordInput from './auth/PasswordInput';
import { useSecurePasswordManager } from '@/hooks/useSecurePasswordManager';

interface AuthFormProps {
  onAuthenticate: (isAuthenticated: boolean) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticate }) => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { verifySecurePassword, setSecureAreaAuthorization, checkSecureAreaAuthorization } = useSecurePasswordManager();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthorized = await checkSecureAreaAuthorization();
      if (isAuthorized) {
        onAuthenticate(true);
      }
    };
    
    checkAuth();
  }, [checkSecureAreaAuthorization, onAuthenticate]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      // No more default password check - only use database verification
      const isValid = await verifySecurePassword(password);
      
      if (isValid) {
        await setSecureAreaAuthorization(true);
        onAuthenticate(true);
        setPasswordError("");
        toast({
          title: "Access Granted",
          description: "You now have access to secure login details",
        });
        console.log("Authentication successful");
      } else {
        setPasswordError("Incorrect password");
        toast({
          title: "Access Denied",
          description: "The password is incorrect",
          variant: "destructive",
        });
        console.log("Authentication failed: incorrect password");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setPasswordError("Authentication error");
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={`container mx-auto flex items-center justify-center ${isMobile ? 'h-screen px-4' : 'h-[calc(100vh-4rem)]'}`}>
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} mx-auto bg-card shadow-premium-md rounded-2xl`}>
        <AuthFormHeader />
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className={isMobile ? 'px-6 py-4' : ''}>
            <div className="grid w-full items-center gap-4">
              <PasswordInput 
                password={password}
                setPassword={setPassword}
                error={passwordError}
              />
            </div>
          </CardContent>
          <CardFooter className={isMobile ? 'px-6 pb-6' : ''}>
            <Button 
              type="submit" 
              variant="premium" 
              className={`w-full rounded-2xl shadow-premium-yellow transition-all duration-300 hover:opacity-90 transform hover:-translate-y-1 ${isMobile ? 'h-12 text-base' : ''}`}
              disabled={isVerifying}
            >
              {isVerifying ? "Authenticating..." : "Authenticate"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
