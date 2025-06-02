
import React, { useEffect } from 'react';

const HttpsEnforcer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Check if we're in a browser environment (not during SSR)
    if (typeof window !== 'undefined') {
      // Check if we're not on localhost and not already on HTTPS
      if (
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1' &&
        window.location.protocol !== 'https:'
      ) {
        // Redirect to HTTPS
        window.location.href = `https://${window.location.hostname}${window.location.pathname}${window.location.search}`;
      }
    }
  }, []);

  return <>{children}</>;
};

export default HttpsEnforcer;
