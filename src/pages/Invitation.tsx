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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Section */}
        <div className="flex justify-center">
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
        <div className="w-full max-w-4xl flex flex-col items-center justify-center space-y-6">
          <img
            src="/lovable-uploads/66b7d592-3cba-46c5-bf28-3b831144ce6c.png"
            alt="Dolce & Banana Invitation"
            className="w-full h-auto object-contain rounded-lg shadow-lg"
          />
          <img
            src="/lovable-uploads/200e1c01-1345-4a32-919f-4b57ba9618bd.png"
            alt="Subscription Analytics"
            className="w-full max-w-md h-auto object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Invitation;