
import React from "react";
import { Link } from "react-router-dom";
import { Creator } from "../types";
import { Button } from "@/components/ui/button";
import { BarChart2, Pencil, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
  const isMobile = useIsMobile();
  
  // Map gender to tag class
  const getGenderTagClass = (gender: string) => {
    switch (gender.toLowerCase()) {
      case "male":
        return "tag-male";
      case "female":
        return "tag-female";
      case "trans":
        return "tag-trans";
      default:
        return "bg-gray-700/70 text-gray-300";
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get social media icons based on available links
  const renderSocialIcons = () => {
    return (
      <div className="flex space-x-2">
        {creator.socialLinks.instagram && (
          <a
            href={creator.socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <span className="text-lg">📷</span>
          </a>
        )}
        {creator.socialLinks.tiktok && (
          <a
            href={creator.socialLinks.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <span className="text-lg">🎵</span>
          </a>
        )}
        {creator.socialLinks.twitter && (
          <a
            href={creator.socialLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <span className="text-lg">🐦</span>
          </a>
        )}
        {creator.socialLinks.reddit && (
          <a
            href={creator.socialLinks.reddit}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <span className="text-lg">👽</span>
          </a>
        )}
        {creator.socialLinks.chaturbate && (
          <a
            href={creator.socialLinks.chaturbate}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <span className="text-lg">🔞</span>
          </a>
        )}
      </div>
    );
  };

  // Check if we should use a responsive layout based on screen size and content
  const useResponsiveLayout = isMobile || creator.team.length > 8;

  return (
    <div className={cn(
      "creator-card", 
      "min-h-[200px]", // Ensure minimum height
      creator.needsReview ? "border-2 border-red-500" : ""
    )}>
      <div className="flex items-start mb-3">
        <Avatar className="w-12 h-12 mr-3 border border-border shrink-0">
          <AvatarImage src={creator.profileImage} alt={creator.name} />
          <AvatarFallback>{getInitials(creator.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow min-w-0"> {/* min-width prevents overflow issues */}
          <h3 className="font-medium text-lg truncate">{creator.name}</h3>
          
          {!useResponsiveLayout ? (
            // Standard layout - all tags in one line
            <div className="flex flex-wrap gap-1 mt-1">
              <span className={cn("tag", getGenderTagClass(creator.gender))}>
                {creator.gender}
              </span>
              {creator.creatorType === "AI" && (
                <span className="tag bg-gray-100/30 text-gray-100">
                  AI
                </span>
              )}
              {creator.needsReview && (
                <span className="tag bg-red-900/40 text-red-200">
                  Review
                </span>
              )}
            </div>
          ) : (
            // Responsive layout - gender on first line, other tags on second line
            <>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className={cn("tag", getGenderTagClass(creator.gender))}>
                  {creator.gender}
                </span>
              </div>
              {(creator.creatorType === "AI" || creator.needsReview) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {creator.creatorType === "AI" && (
                    <span className="tag bg-gray-100/30 text-gray-100">
                      AI
                    </span>
                  )}
                  {creator.needsReview && (
                    <span className="tag bg-red-900/40 text-red-200">
                      Review
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-right shrink-0 ml-1">
          <span className="tag bg-secondary/40 text-foreground whitespace-nowrap">
            {creator.team}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between my-4">
        {renderSocialIcons()}
        {creator.needsReview && (
          <div className="text-red-500 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Needs Review</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Link to={`/creators/${creator.id}/analytics`} className="flex-1">
          <Button variant="secondary" className="w-full">
            <BarChart2 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </Link>
        <Link to={`/creators/${creator.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CreatorCard;
