
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreatorNotFound: React.FC = () => {
  return (
    <div className="p-8 w-full min-h-screen bg-background">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Creator not found</h3>
        <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist</p>
        <Link to="/creators">
          <Button>Return to creators</Button>
        </Link>
      </div>
    </div>
  );
};

export default CreatorNotFound;
