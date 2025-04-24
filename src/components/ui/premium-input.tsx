
import React from "react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

export interface PremiumInputProps extends InputProps {}

export const PremiumInput: React.FC<PremiumInputProps> = ({ 
  className, 
  ...props 
}) => {
  return (
    <Input
      className={cn(
        "bg-[#1a1a33] border-[#252538] text-white placeholder-gray-400 focus:border-primary focus:ring-primary/20",
        className
      )}
      {...props}
    />
  );
};

export default PremiumInput;
