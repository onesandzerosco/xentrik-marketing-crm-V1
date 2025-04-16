
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
  const { verifySecurePassword } = useSecurePasswordManager();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    
    try {
      console.log("Verifying password:", password);
      const isValid = await verifySecurePassword(password);
      
      if (isValid) {
        onAuthenticate(true);
        setPasswordError("");
        toast({
          title: "Access Granted",
          description: "You now have access to secure login details",
        });
        console.log("Authentication successful");
        
        // Store auth state in localStorage
        localStorage.setItem("secure_area_authorized", "true");
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
    <div className="container mx-auto flex items-center justify-center h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md mx-auto bg-card shadow-premium-md rounded-2xl">
        <AuthFormHeader />
        <form onSubmit={handlePasswordSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <PasswordInput 
                password={password}
                setPassword={setPassword}
                error={passwordError}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              variant="premium" 
              className="w-full rounded-2xl shadow-premium-yellow transition-all duration-300 hover:opacity-90 transform hover:-translate-y-1"
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
