
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const NoCreatorSelected: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Creator</CardTitle>
        <CardDescription>
          Please select a creator from the list to manage their login details
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default NoCreatorSelected;
