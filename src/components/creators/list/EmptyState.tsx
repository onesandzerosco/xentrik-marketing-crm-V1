
import React from "react";
import { Users, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center ${isMobile ? 'py-12' : 'py-16'} text-center`}>
      <div className={`rounded-full bg-muted p-${isMobile ? '4' : '6'} mb-4`}>
        {hasFilters ? (
          <Search className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground`} />
        ) : (
          <Users className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground`} />
        )}
      </div>
      
      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-foreground mb-2`}>
        {hasFilters ? "No creators found" : "No creators yet"}
      </h3>
      
      <p className={`text-muted-foreground ${isMobile ? 'text-sm px-4' : 'text-base'} max-w-md mx-auto`}>
        {hasFilters 
          ? "Try adjusting your search or filter criteria to find creators."
          : "Creators will appear here once they are added to the system."
        }
      </p>
    </div>
  );
};

export default EmptyState;
