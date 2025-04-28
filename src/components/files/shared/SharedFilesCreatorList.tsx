
import React from "react";
import { Loader2 } from "lucide-react";
import { Creator } from "@/types";
import CreatorCard from "@/components/CreatorCard";
import SharedFilesEmptyState from "./SharedFilesEmptyState";

interface SharedFilesCreatorListProps {
  isLoading: boolean;
  creators: Creator[];
  hasFilters: boolean;
  fileCountsMap?: Record<string, { total: number; uploading: number }>;
}

const SharedFilesCreatorList: React.FC<SharedFilesCreatorListProps> = ({ 
  isLoading, 
  creators, 
  hasFilters,
  fileCountsMap = {}
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (creators.length === 0) {
    return <SharedFilesEmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-2">
      {creators.map(creator => (
        <CreatorCard 
          key={creator.id} 
          creator={creator} 
          variant="files"
        />
      ))}
    </div>
  );
};

export default SharedFilesCreatorList;
