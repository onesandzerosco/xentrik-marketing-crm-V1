
import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  className?: string;
  children: React.ReactNode;
}

export function CheckboxGroup({ className, children }: CheckboxGroupProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {children}
    </div>
  );
}
