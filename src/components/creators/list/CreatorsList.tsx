
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Creator } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
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
      <div className="grid grid-cols-1 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 bg-card/50 backdrop-blur-sm shadow-sm border border-[#252538]">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
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
    <div className="flex flex-col gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="p-4 bg-[#171727] backdrop-blur-sm shadow-sm border border-[#252538] relative">
          <div className="flex gap-4 items-center">
            <Avatar className="h-16 w-16 border-2 border-[#252538] shadow-md">
              <AvatarImage src={creator.profileImage} alt={creator.name} />
              <AvatarFallback className="text-lg font-semibold bg-[#252538]">
                {creator.name[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg text-white">{creator.name}</h3>
              <p className="text-gray-400 text-sm mb-2">ID: {creator.id?.split("-")[0] || "unknown"}</p>
              
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
                
                {creator.creatorType && (
                  <Badge variant="outline" className="bg-[#252538]/30 text-white border-[#252538]/80">
                    {creator.creatorType}
                  </Badge>
                )}
              </div>
            </div>
            
            {renderCreatorActions && renderCreatorActions(creator)}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CreatorsList;
