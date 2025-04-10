
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LockKeyhole } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      <Card className="w-full max-w-md mx-auto bg-card shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <LockKeyhole className="w-6 h-6" />
            Secure Area
          </CardTitle>
          <CardDescription>
            Enter the password to access creator login details
          </CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Authenticate
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AuthForm;
