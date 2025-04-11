
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { Creator } from '../../types';

interface CreatorSelectProps {
  creators: Creator[];
  selectedCreator: Creator | null;
  onSelectCreator: (creatorId: string) => void;
}

const CreatorSelect: React.FC<CreatorSelectProps> = ({ 
  creators, 
  selectedCreator, 
  onSelectCreator 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creators</CardTitle>
        <CardDescription>Select a creator to manage login details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {creators.map(creator => (
            <Button
              key={creator.id}
              variant={selectedCreator?.id === creator.id ? "premium" : "outline"}
              className="w-full justify-start rounded-[15px] transition-all duration-300 hover:opacity-90"
              onClick={() => onSelectCreator(creator.id)}
            >
              <UserCircle className="w-5 h-5 mr-2" />
              {creator.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorSelect;
