
import React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

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
