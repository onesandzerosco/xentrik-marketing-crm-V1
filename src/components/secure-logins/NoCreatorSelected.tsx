
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const NoCreatorSelected: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="text-yellow-500 h-5 w-5" />
          Select a Creator
        </CardTitle>
        <CardDescription>
          Please select a creator from the list to manage their login details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Choose a creator from the sidebar to view and manage their social media login credentials.
        </p>
      </CardContent>
    </Card>
  );
};

export default NoCreatorSelected;
