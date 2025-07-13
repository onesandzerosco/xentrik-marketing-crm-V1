
import React from "react";
import { Loader2 } from "lucide-react";
import { Creator } from "@/types";
import CreatorsList from "../list/CreatorsList";
import EmptyState from "../list/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatorsManagementListProps {
  isLoading: boolean;
  creators: Creator[];
  hasFilters: boolean;
}

const CreatorsManagementList: React.FC<CreatorsManagementListProps> = ({ 
  isLoading, 
  creators, 
  hasFilters 
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-yellow mb-4" />
          <p className="text-muted-foreground text-center">Loading creators...</p>
        </div>
      </div>
    );
  }

  if (creators.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className={isMobile ? "px-2" : ""}>
      <CreatorsList 
        isLoading={isLoading}
        creators={creators}
        hasFilters={hasFilters}
      />
    </div>
  );
};

export default CreatorsManagementList;
