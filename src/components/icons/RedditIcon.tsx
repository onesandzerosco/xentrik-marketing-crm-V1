
import React from 'react';

export const RedditIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={`lucide lucide-reddit ${className}`}
    {...props}
  >
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
    <path d="M8 13.5A1.5 1.5 0 1 0 9.5 12 1.5 1.5 0 0 0 8 13.5Z" />
    <path d="M16 13.5a1.5 1.5 0 1 0 1.5-1.5 1.5 1.5 0 0 0-1.5 1.5Z" />
    <path d="M8.5 16a4 4 0 0 1 7 0" />
  </svg>
);
