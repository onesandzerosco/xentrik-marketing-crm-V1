
import React from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Creator } from "@/types";
import CreatorCard from "@/components/CreatorCard";
import ManagementEmptyState from "./ManagementEmptyState";

interface CreatorsManagementListProps {
  isLoading: boolean;
  creators: Creator[];
  hasFilters: boolean;
}

const CreatorsManagementList: React.FC<CreatorsManagementListProps> = ({ isLoading, creators, hasFilters }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (creators.length === 0) {
    return <ManagementEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-2">
      {creators.map(creator => (
        <Link key={creator.id} to={`/creator-profile/${creator.id}`}>
          <CreatorCard 
            key={creator.id} 
            creator={creator} 
            variant="default"
          />
        </Link>
      ))}
    </div>
  );
};

export default CreatorsManagementList;
