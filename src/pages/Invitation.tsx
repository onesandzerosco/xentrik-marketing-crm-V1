import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const LOGO_PATH = 'xentrik-logo.png';
const BUCKET_NAME = 'logos';

const Invitation = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const {
          data: {
            publicUrl
          }
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(LOGO_PATH);
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
    <div className="min-h-screen bg-background">
      {/* Logo Section */}
      <div className="flex justify-center pt-12 pb-8">
        {!logoLoaded && <div className="h-[70px] w-[170px] bg-muted animate-pulse rounded"></div>}
        {logoUrl && (
          <img
            src={logoUrl}
            alt="Xentrik Marketing"
            className={cn(
              "h-[70px] w-auto object-contain transition-opacity duration-300",
              logoLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ willChange: "transform" }}
            onLoad={handleImageLoad}
          />
        )}
      </div>

      {/* Invitation Content Area */}
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl bg-card rounded-lg border border-border shadow-sm min-h-[600px] p-8">
            {/* Blank area for invitation content */}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <p>Invitation content will be placed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invitation;