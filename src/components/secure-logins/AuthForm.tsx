
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LockKeyhole } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AuthFormHeader from './auth/AuthFormHeader';
import PasswordInput from './auth/PasswordInput';

interface AuthFormProps {
  onAuthenticate: (isAuthenticated: boolean) => void;
  securePassword: string;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticate, securePassword }) => {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Authentication attempt with password:", password);
    console.log("Secure password:", securePassword);
    
    if (password === securePassword) {
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
  };

  return (
    <div className="container mx-auto flex items-center justify-center h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md mx-auto bg-card shadow-premium-md">
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
            <Button type="submit" variant="premium" className="w-full rounded-sm shadow-premium-yellow">
              Authenticate
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
