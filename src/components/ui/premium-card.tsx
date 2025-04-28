
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./card";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  // Add the missing props
  title?: string;
  description?: string;
  features?: string[];
  price?: string;
  period?: string;
  buttonText?: string;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  header,
  footer,
  children,
  // Add the new props with defaults
  title,
  description,
  features = [],
  price,
  period,
  buttonText = "Get Started",
  ...props
}) => {
  // If title or description is provided, generate a default header
  const defaultHeader = (title || description) ? (
    <>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </>
  ) : null;

  // If features, price or period is provided, generate default content
  const hasDefaultContent = features.length > 0 || price || period;
  
  return (
    <Card
      className={cn(
        "bg-[#1a1a33]/50 backdrop-blur-sm border border-[#252538]/50 rounded-xl overflow-hidden",
        className
      )}
      {...props}
    >
      {header || defaultHeader ? (
        <CardHeader className={cn("p-6", headerClassName)}>
          {header || defaultHeader}
        </CardHeader>
      ) : null}
      
      <CardContent className={cn("p-6", !header && !defaultHeader && "pt-6", contentClassName)}>
        {hasDefaultContent && !children ? (
          <div className="space-y-4">
            {features.length > 0 && (
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 mr-2 text-primary"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {price && (
              <div className="flex items-baseline mt-4">
                <span className="text-3xl font-bold">{price}</span>
                {period && <span className="text-sm text-muted-foreground ml-1">/{period}</span>}
              </div>
            )}
            
            {buttonText && (
              <Button className="w-full mt-4">{buttonText}</Button>
            )}
          </div>
        ) : (
          children
        )}
      </CardContent>
      
      {footer && (
        <CardFooter className={cn("p-6 border-t border-[#252538]/50", footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
};

export default PremiumCard;
