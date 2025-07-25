import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MarketingFilesEmptyStateProps {
  hasFilters: boolean;
}

const MarketingFilesEmptyState: React.FC<MarketingFilesEmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="text-center py-12 bg-card/50 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-2">No creators with marketing files found</h3>
      <p className="text-muted-foreground mb-4">
        {hasFilters ? 
          "Try changing your filters or upload marketing files to creators" : 
          "Upload marketing files to creators to see them here"
        }
      </p>
      <Link to="/creators/onboard">
        <Button variant="premium" className="shadow-premium-yellow hover:shadow-premium-highlight">
          <Plus className="h-4 w-4 mr-2" />
          Onboard Creator
        </Button>
      </Link>
    </div>
  );
};

export default MarketingFilesEmptyState;