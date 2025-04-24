
import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import type { ButtonProps as ShadcnButtonProps } from "./button";

export interface PremiumButtonProps extends Omit<ShadcnButtonProps, "variant"> {
  variant?: "default" | "outline" | "destructive";
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}) => {
  return (
    <Button
      variant={variant === "default" ? "premium" : variant}
      className={cn(
        "transform transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PremiumButton;
