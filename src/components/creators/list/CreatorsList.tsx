
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Creator } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Instagram, Users } from "lucide-react";
import EmptyState from "./EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

interface CreatorsListProps {
  creators: Creator[];
  isLoading: boolean;
  hasFilters: boolean;
  renderCreatorActions?: (creator: Creator) => React.ReactNode;
}

const CreatorsList: React.FC<CreatorsListProps> = ({ 
  creators, 
  isLoading, 
  hasFilters,
  renderCreatorActions 
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm shadow-sm border border-[#252538]">
            <div className="flex gap-4 items-start">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <EmptyState 
        hasFilters={hasFilters}
        title={hasFilters ? "No matching creators" : "No creators found"} 
        description={hasFilters 
          ? "Try adjusting your filters, or add a new creator with the button above." 
          : "Looks like you haven't onboarded any creators yet. Start by creating your first creator profile."
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator) => (
        <Card key={creator.id} className="p-6 bg-card/50 backdrop-blur-sm shadow-sm border border-[#252538]">
          <div className="flex gap-4 items-start">
            <Avatar className="h-16 w-16 border-2 border-[#252538] shadow-md">
              <AvatarImage src={creator.profileImage} alt={creator.name} />
              <AvatarFallback className="text-lg font-semibold bg-[#252538]">
                {creator.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg line-clamp-1">{creator.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-1">
                {creator.gender && (
                  <Badge variant="outline" className="bg-[#252538]/30 text-white border-[#252538]/80">
                    {creator.gender}
                  </Badge>
                )}
                
                {creator.team && (
                  <Badge variant="outline" className="bg-[#252538]/30 text-white border-[#252538]/80">
                    <Users className="h-3 w-3 mr-1" /> 
                    {creator.team}
                  </Badge>
                )}
                
                {creator.creatorType === "AI" && (
                  <Badge variant="outline" className="bg-[#252538]/30 text-white border-[#252538]/80">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                )}
              </div>
              
              <div className="mt-3 flex flex-col gap-2">
                {creator.socialLinks?.instagram && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Instagram className="h-3.5 w-3.5 mr-1" /> 
                    {creator.socialLinks.instagram}
                  </div>
                )}
                
                {creator.needsReview && (
                  <Badge variant="outline" className="mt-1 w-fit bg-red-900/40 text-red-200 border-red-800/30">
                    Needs Review
                  </Badge>
                )}
              </div>
              
              {renderCreatorActions && (
                <div className="mt-4">
                  {renderCreatorActions(creator)}
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CreatorsList;
