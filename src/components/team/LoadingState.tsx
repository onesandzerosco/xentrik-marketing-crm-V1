
import React from "react";

const LoadingState: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[300px]">
      <div className="text-center">
        <p className="text-muted-foreground">Loading team member information...</p>
      </div>
    </div>
  );
};

export default LoadingState;
