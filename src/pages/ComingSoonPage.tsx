
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ComingSoonPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md mx-auto text-center">
        <CardContent className="pt-6">
          <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
          <p className="text-muted-foreground mb-6">
            We're working hard to bring you this feature. Please check back later.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoonPage;
