
import React from 'react';
import { Link } from 'react-router-dom';
import { Creator } from '@/types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface CreatorCardProps {
  creator: Creator;
  fileStats?: {
    total: number;
    uploading: number;
  };
}

const CreatorCard = ({ creator, fileStats = { total: 0, uploading: 0 } }: CreatorCardProps) => {
  const { toast } = useToast();
  const hasUploads = fileStats.uploading > 0;

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/creator-files/${creator.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "The sharing link has been copied to your clipboard.",
    });
  };

  return (
    <Card className="p-4 hover:bg-accent/5 transition-colors group">
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
              <div className="text-sm text-muted-foreground mt-0.5">
                {fileStats.total} {fileStats.total === 1 ? 'file' : 'files'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleShare}
                className="h-9 hover:bg-gradient-premium-yellow hover:text-black transition-all"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Link to={`/creator-files/${creator.id}`}>
                <Button 
                  variant="premium" 
                  className="h-9 shadow-premium-yellow hover:shadow-premium-highlight"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  View Files
                </Button>
              </Link>
            </div>
          </div>
          
          {hasUploads && (
            <div className="mt-3">
              <Progress value={65} className="h-2" />
              <span className="text-xs text-primary mt-1 block">
                {fileStats.uploading} files uploading...
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreatorCard;
