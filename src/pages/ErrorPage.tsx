
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
      <p className="text-lg text-muted-foreground mb-6">We encountered an error while processing your request.</p>
      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()}>Try Again</Button>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
