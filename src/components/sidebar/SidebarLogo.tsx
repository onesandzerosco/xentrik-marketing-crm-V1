
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const logoUrl = "/lovable-uploads/318000f3-5bdf-47aa-8bdc-32a1ddb70c6b.png";

const preloadImage = (src: string) => {
  const img = new Image();
  img.src = src;
  return img;
};

const SidebarLogo: React.FC = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const img = preloadImage(logoUrl);
    img.onload = () => setLogoLoaded(true);
    
    if (img.complete) {
      setLogoLoaded(true);
    }
  }, []);

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
