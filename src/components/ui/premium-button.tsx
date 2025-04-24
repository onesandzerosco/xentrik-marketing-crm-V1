
import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ButtonProps } from "./button";

export interface PremiumButtonProps extends ButtonProps {
  variant?: "default" | "outline" | "destructive";
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}) => {
  return variant === "default" ? (
    <Button
      className={cn(
        "text-black rounded-[15px] px-4 py-2 transition-all hover:-translate-y-0.5 hover:shadow-premium-yellow hover:opacity-90 bg-gradient-premium-yellow shadow-premium-yellow",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  ) : variant === "outline" ? (
    <Button
      variant="outline"
      className={cn(
        "border-[#252538] hover:bg-[#252538]/20 rounded-[15px] transition-all hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  ) : (
    <Button
      variant="destructive"
      className={cn(
        "rounded-[15px] transition-all hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
};

export default PremiumButton;
