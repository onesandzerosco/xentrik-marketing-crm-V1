
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const logoUrl = "/lovable-uploads/20bc55f1-9a4b-4fc9-acf0-bfef2843d250.png";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'your-email@example.com',    // Replace with form input
        password: 'your-password',          // Replace with form input
      });

      if (error) throw error;

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center pt-6">
            <img 
              src={logoUrl} 
              alt="XENTRIK MARKETING" 
              className="h-44 mx-auto"
            />
          </div>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleEmailLogin} 
              className="w-full bg-brand-yellow text-black hover:bg-brand-highlight"
            >
              Sign In with Email
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Secure authentication powered by Supabase
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
