
import React from "react";
import { Link } from "react-router-dom";
import { Creator } from "../types";
import { Button } from "@/components/ui/button";
import { 
  BarChart2, 
  Pencil,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className={`flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-accent/5 transition-colors ${creator.needsReview ? "border-red-500" : ""}`}>
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Avatar className="h-12 w-12 border border-border shrink-0">
          <AvatarImage src={creator.profileImage} alt={creator.name} />
          <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{creator.name}</h3>
            {creator.needsReview && (
              <Badge variant="destructive" className="shrink-0">
                <AlertCircle className="h-3 w-3 mr-1" />
                Review
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="truncate">ID: {creator.id}</span>
            <span className="text-xs">•</span>
            <Badge variant="outline" className="capitalize">
              {creator.gender}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {creator.team}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
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
