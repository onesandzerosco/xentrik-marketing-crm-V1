
import React from 'react';
import { Link } from 'react-router-dom';
import { Creator } from '@/types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Edit } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard = ({ creator }: CreatorCardProps) => {
  return (
    <Link to={`/creator-profile/${creator.id}`}>
      <Card className="p-4 hover:bg-accent/5 transition-colors group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {creator.profileImage ? (
              <img 
                src={creator.profileImage} 
                alt={creator.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-all"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-premium-highlight/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary/60 group-hover:text-primary/80 transition-colors">
                  {creator.name[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{creator.name}</h3>
                <div className="text-sm text-muted-foreground mt-0.5 text-left">
                  ID: {creator.id}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{creator.gender}</Badge>
                  <Badge variant="secondary">{creator.team}</Badge>
                  <Badge variant="secondary">{creator.creatorType}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    className="h-9 hover:bg-gradient-premium-yellow hover:text-black transition-all"
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/creator-profile/${creator.id}`} onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="premium" 
                    className="h-9 shadow-premium-yellow hover:shadow-premium-highlight"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CreatorCard;
