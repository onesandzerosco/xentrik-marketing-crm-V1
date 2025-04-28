
import React from "react";
import { Loader2 } from "lucide-react";
import { Creator } from "@/types";
import CreatorCard from "@/components/CreatorCard";
import EmptyState from "./EmptyState";

interface CreatorsListProps {
  isLoading: boolean;
  creators: Creator[];
  hasFilters: boolean;
}

const CreatorsList: React.FC<CreatorsListProps> = ({ isLoading, creators, hasFilters }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (creators.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-2">
      {creators.map(creator => (
        <Link key={creator.id} to={`/creator-profile/${creator.id}`}>
          <CreatorCard 
            creator={creator} 
            variant="default"
          />
        </Link>
      ))}
    </div>
  );
};

export default CreatorsList;
