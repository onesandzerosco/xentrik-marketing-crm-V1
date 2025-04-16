
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  className 
}) => {
  return (
    <Link to={to}>
      <Button 
        variant="ghost" 
        size="icon" 
        className={`rounded-full ${className}`}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Go back</span>
      </Button>
    </Link>
  );
};
