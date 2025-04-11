
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const logoUrl = "/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png";

// Preload the logo image once at the module level
const preloadedImage = new Image();
preloadedImage.src = logoUrl;

const SidebarLogo: React.FC = () => {
  const [logoLoaded, setLogoLoaded] = useState(() => preloadedImage.complete);

  useEffect(() => {
    // If the image wasn't already loaded when component mounted, set up a one-time handler
    if (!logoLoaded) {
      const handleLoad = () => {
        setLogoLoaded(true);
        // Remove the event listener after it fires once
        preloadedImage.removeEventListener('load', handleLoad);
      };
      
      preloadedImage.addEventListener('load', handleLoad);
      
      // If the image completes loading while we're setting up the listener
      if (preloadedImage.complete) {
        setLogoLoaded(true);
      }
      
      return () => {
        preloadedImage.removeEventListener('load', handleLoad);
      };
    }
  }, [logoLoaded]);

  return (
    <div className="flex h-20 items-center justify-center pt-5 pb-2">
      {!logoLoaded && (
        <div className="h-[67.5px] w-auto bg-premium-dark/20 animate-pulse rounded"></div>
      )}
      <img
        src={logoUrl}
        alt="Xentrik Marketing"
        className={cn(
          "h-[67.5px] w-auto object-contain transition-opacity duration-300",
          logoLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ willChange: "transform" }}
      />
    </div>
  );
};

export default SidebarLogo;
