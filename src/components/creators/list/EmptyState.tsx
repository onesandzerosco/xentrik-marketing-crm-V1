
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="text-center py-12 bg-card/50 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-2">No creators found</h3>
      <p className="text-muted-foreground mb-4">
        {hasFilters ? 
          "Try changing your filters or add a new creator" : 
          "Get started by adding your first creator"
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

export default EmptyState;
