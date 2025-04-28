
import React from 'react';
import { Link } from 'react-router-dom';
import { Creator } from '@/types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Edit, FileText, Share } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export type CardVariant = 'creators' | 'files';

interface CreatorCardProps {
  creator: Creator;
  variant?: CardVariant;
}

const CreatorCard = ({ creator, variant = 'creators' }: CreatorCardProps) => {
  // Render different content based on variant
  const renderCardActions = () => {
    switch (variant) {
      case 'files':
        return (
          <>
            <Link to={`/creator-files/${creator.id}`} onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                className="px-8 h-10 bg-gradient-premium-yellow text-black hover:opacity-90 transition-all"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Files
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-9"
              onClick={(e) => {
                e.stopPropagation();
                // Share functionality would go here
                console.log('Share files for creator:', creator.id);
              }}
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </>
        );
      case 'creators':
      default:
        return (
          <>
            <Link to={`/creator-analytics/${creator.id}`} onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="ghost" 
                className="px-8 h-10 bg-gradient-premium-yellow text-black hover:opacity-90 transition-all"
              >
                <LineChart className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link to={`/creator-profile/${creator.id}`} onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="secondary" 
                size="sm"
                className="h-9"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </>
        );
    }
  };

  const renderCardContent = () => (
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
        
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="text-left">
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">{creator.name}</h3>
              <div className="text-sm text-muted-foreground mt-0.5">
                ID: {creator.id}
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="bg-pink-900/40 text-pink-200 hover:bg-pink-900/60">
                  {creator.gender}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-900/40 text-yellow-200 hover:bg-yellow-900/60">
                  {creator.team}
                </Badge>
                <Badge variant="secondary" className="bg-blue-900/40 text-blue-200 hover:bg-blue-900/60">
                  {creator.creatorType}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {renderCardActions()}
          </div>
        </div>
      </div>
    </Card>
  );

  // For creators page, wrap in a Link
  if (variant === 'creators') {
    return (
      <Link to={`/creator-profile/${creator.id}`}>
        {renderCardContent()}
      </Link>
    );
  }

  // For other pages, just render the card content without a wrapping Link
  return renderCardContent();
};

export default CreatorCard;
