
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-8 text-white">
      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-white" />
      Loading submissions...
    </div>
  );
};

export default LoadingState;
