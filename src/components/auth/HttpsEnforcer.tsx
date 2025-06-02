
import React, { useEffect } from 'react';

const HttpsEnforcer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Check if we're in a browser environment (not during SSR)
    if (typeof window !== 'undefined') {
      // Only enforce HTTPS redirection in development or if not already on HTTPS
      // For Vercel deployment, let Vercel handle HTTPS enforcement
      if (
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
      ) {
        // Don't enforce HTTPS for local development
        return;
      }
      
      // For production domains, ensure HTTPS
      if (window.location.protocol !== 'https:') {
        window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
      }
    }
  }, []);

  return <>{children}</>;
};

export default HttpsEnforcer;
