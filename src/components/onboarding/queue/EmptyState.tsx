
import React from "react";

const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 md:py-12 text-muted-foreground">
      <p className="text-sm md:text-base">No pending submissions found.</p>
    </div>
  );
};

export default EmptyState;
