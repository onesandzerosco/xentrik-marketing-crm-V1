
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center max-w-3xl px-4">
        <img 
          src="/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png" 
          alt="Xentrik Marketing" 
          className="h-[56px] w-auto object-contain mx-auto mb-8" 
        />
        <h1 className="text-4xl font-bold mb-4">Xentrik Marketing Creator Management</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Manage your influencer marketing campaigns, track performance, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/login')}
            className="px-8"
          >
            Login
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-8"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
