
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, ChevronDown } from 'lucide-react';
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
        <Select
          value={selectedCreator?.id || ''}
          onValueChange={onSelectCreator}
        >
          <SelectTrigger className={`w-full ${isMobile ? 'h-12' : 'h-10'} rounded-[15px]`}>
            <div className="flex items-center gap-2">
              <UserCircle className={`${isMobile ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
              <SelectValue 
                placeholder="Choose a creator"
                className={isMobile ? 'text-base' : 'text-sm'}
              />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-md">
            {creators.map(creator => (
              <SelectItem 
                key={creator.id} 
                value={creator.id}
                className="cursor-pointer hover:bg-muted/50 focus:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{creator.modelName || creator.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default CreatorSelect;
