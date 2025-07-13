
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();

  return (
    <Card className={isMobile ? 'w-full' : ''}>
      <CardHeader className={isMobile ? 'pb-4' : ''}>
        <CardTitle className={isMobile ? 'text-lg' : ''}>Creators</CardTitle>
        <CardDescription className={isMobile ? 'text-sm' : ''}>
          Select a creator to manage login details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${isMobile ? 'grid grid-cols-1 gap-3' : 'space-y-2'}`}>
          {creators.map(creator => (
            <Button
              key={creator.id}
              variant={selectedCreator?.id === creator.id ? "premium" : "outline"}
              className={`${isMobile ? 'w-full h-12 text-left' : 'w-full'} justify-start rounded-[15px] transition-all duration-300 hover:opacity-90`}
              onClick={() => onSelectCreator(creator.id)}
            >
              <UserCircle className={`${isMobile ? 'w-6 h-6' : 'w-5 h-5'} mr-2 flex-shrink-0`} />
              <span className={`${isMobile ? 'text-base' : ''} truncate`}>{creator.name}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreatorSelect;
