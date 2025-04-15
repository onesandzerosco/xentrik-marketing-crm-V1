
import React from "react";
import { Link } from "react-router-dom";
import { Creator } from "../types";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  Pencil,
  AlertCircle,
  Instagram,
  Twitter,
  TwitchIcon,
  Globe,
  MessageCircle
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getSocialIcons = () => {
    const icons = [];
    if (creator.socialLinks?.instagram) icons.push(
      <a href={creator.socialLinks.instagram} target="_blank" rel="noopener noreferrer" key="instagram">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Instagram className="h-4 w-4 text-pink-500" />
        </Button>
      </a>
    );
    if (creator.socialLinks?.twitter) icons.push(
      <a href={creator.socialLinks.twitter} target="_blank" rel="noopener noreferrer" key="twitter">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Twitter className="h-4 w-4 text-blue-400" />
        </Button>
      </a>
    );
    if (creator.socialLinks?.chaturbate) icons.push(
      <a href={creator.socialLinks.chaturbate} target="_blank" rel="noopener noreferrer" key="chaturbate">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <TwitchIcon className="h-4 w-4 text-purple-500" />
        </Button>
      </a>
    );
    return icons;
  };

  return (
    <div className={`flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent/5 transition-colors ${creator.needsReview ? "border-red-500" : ""}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className="h-12 w-12 border border-border shrink-0">
          <AvatarImage src={creator.profileImage} alt={creator.name} />
          <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{creator.name}</h3>
            {creator.needsReview && (
              <Badge variant="destructive" className="shrink-0">
                <AlertCircle className="h-3 w-3 mr-1" />
                Review
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="truncate">ID: {creator.id}</span>
            <span className="text-xs">•</span>
            <Badge variant="outline" className="capitalize">
              {creator.gender}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {creator.team}
            </Badge>
          </div>

          {(creator.tags && creator.tags.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {creator.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getSocialIcons()}
        <div className="h-6 w-px bg-border mx-2" />
        <Link to={`/creators/${creator.id}/analytics`}>
          <Button variant="outline" size="sm" className="h-8">
            <BarChart2 className="h-4 w-4" />
          </Button>
        </Link>
        <Link to={`/creators/${creator.id}`}>
          <Button variant="outline" size="sm" className="h-8">
            <Pencil className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CreatorCard;
