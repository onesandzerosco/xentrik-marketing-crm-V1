
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Creator } from "@/types";
import { Upload, FileText, Users, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatorCardProps {
  creator: Creator;
  variant?: "default" | "files";
  fileCount?: number;
  showUploadingIndicator?: boolean;
  uploadingCount?: number;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canUpload: boolean;
    canDownload: boolean;
  };
}

const CreatorCard: React.FC<CreatorCardProps> = ({ 
  creator, 
  variant = "default",
  fileCount = 0,
  showUploadingIndicator = false,
  uploadingCount = 0,
  permissions
}) => {
  const isMobile = useIsMobile();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getGenderBadgeColor = (gender: string) => {
    switch (gender.toLowerCase()) {
      case 'male': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'female': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'trans': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTeamBadgeColor = (team: string) => {
    switch (team) {
      case 'A Team': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B Team': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'C Team': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={`bg-premium-card border border-[#333333] rounded-lg p-${isMobile ? '4' : '6'} hover:bg-premium-highlight transition-all duration-200 cursor-pointer`}>
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        {/* Left side - Avatar and Info */}
        <div className={`flex items-center ${isMobile ? 'justify-center text-center' : 'space-x-4'}`}>
          <Avatar className={`${isMobile ? 'h-16 w-16' : 'h-12 w-12'}`}>
            <AvatarImage src={creator.profileImage} alt={creator.name} />
            <AvatarFallback className="bg-primary/20 text-primary">
              {getInitials(creator.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className={`${isMobile ? 'mt-3' : ''}`}>
            <h3 className={`font-semibold text-white ${isMobile ? 'text-lg' : 'text-base'}`}>
              {creator.name}
            </h3>
            {creator.telegramUsername && (
              <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-sm'}`}>
                @{creator.telegramUsername}
              </p>
            )}
            {creator.email && (
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-xs'}`}>
                {creator.email}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Badges and Status */}
        <div className={`flex ${isMobile ? 'flex-col space-y-3 items-center' : 'items-center space-x-4'}`}>
          {/* Badges */}
          <div className={`flex ${isMobile ? 'flex-wrap justify-center' : ''} gap-2`}>
            <Badge 
              variant="outline" 
              className={`${getGenderBadgeColor(creator.gender)} ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              {creator.gender}
            </Badge>
            <Badge 
              variant="outline" 
              className={`${getTeamBadgeColor(creator.team)} ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              {creator.team}
            </Badge>
            <Badge 
              variant="outline" 
              className={`bg-primary/20 text-primary border-primary/30 ${isMobile ? 'text-sm' : 'text-xs'}`}
            >
              {creator.creatorType}
            </Badge>
          </div>

          {/* File count for files variant */}
          {variant === "files" && (
            <div className={`flex items-center space-x-4 ${isMobile ? 'justify-center' : ''}`}>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <FileText className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>{fileCount} files</span>
              </div>
              
              {showUploadingIndicator && uploadingCount > 0 && (
                <div className="flex items-center space-x-2 text-yellow-400">
                  <Upload className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} animate-pulse`} />
                  <span className={`${isMobile ? 'text-base' : 'text-sm'}`}>{uploadingCount} uploading</span>
                </div>
              )}
            </div>
          )}

          {/* Status indicators */}
          <div className={`flex items-center space-x-2 ${isMobile ? 'justify-center' : ''}`}>
            {creator.needsReview && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <AlertTriangle className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                {isMobile && <span className="text-sm">Needs Review</span>}
              </div>
            )}
            
            {creator.assignedTeamMembers && creator.assignedTeamMembers.length > 0 && (
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`} />
                {isMobile && <span className="text-sm">{creator.assignedTeamMembers.length} assigned</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tags section for mobile */}
      {isMobile && creator.tags && creator.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#333333]">
          <div className="flex flex-wrap justify-center gap-2">
            {creator.tags.slice(0, 4).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-secondary/50"
              >
                {tag}
              </Badge>
            ))}
            {creator.tags.length > 4 && (
              <Badge variant="secondary" className="text-xs bg-secondary/50">
                +{creator.tags.length - 4} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorCard;
