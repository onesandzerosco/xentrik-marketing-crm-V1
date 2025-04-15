
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const LOGO_PATH = 'xentrik-logo.png';
const BUCKET_NAME = 'logos';

const SidebarLogo: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        // Try to get the public URL for the logo
        const { data: { publicUrl } } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(LOGO_PATH);

        if (publicUrl) {
          setLogoUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    };

    loadLogo();
  }, []);

  const handleImageLoad = () => {
    setLogoLoaded(true);
  };

  return (
    <Link to="/dashboard" className="flex h-20 items-center justify-center pt-5 pb-2 hover:opacity-90 transition-opacity">
      {!logoLoaded && (
        <div className="h-[60px] w-[140px] bg-premium-dark/20 animate-pulse rounded"></div>
      )}
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Xentrik Marketing"
          className={cn(
            "h-[60px] w-auto object-contain transition-opacity duration-300",
            logoLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{ willChange: "transform" }}
          onLoad={handleImageLoad}
        />
      )}
    </Link>
  );
};

export default SidebarLogo;
