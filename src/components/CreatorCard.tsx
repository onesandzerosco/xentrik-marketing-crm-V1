
import React from "react";
import { Link } from "react-router-dom";
import { Creator } from "../types";
import { Button } from "@/components/ui/button";
import { BarChart2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator }) => {
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

  return (
    <div className="creator-card">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-border">
          <img
            src={creator.profileImage}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="font-medium text-lg">{creator.name}</h3>
          <div className="mt-1">
            <span className={cn("tag", getGenderTagClass(creator.gender))}>
              {creator.gender}
            </span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <span className="tag bg-secondary/40 text-foreground">
            {creator.team}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between my-4">
        {renderSocialIcons()}
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
