
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import HttpsEnforcer from './components/auth/HttpsEnforcer';
import './index.css';
import './App.css';

// Get these values from your Auth0 dashboard
const domain = import.meta.env.VITE_AUTH0_DOMAIN || "dev-j4xj7bggmr0zhlid.uk.auth0.com";
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || "GwJvkk5BrTg3dilIeJaMS4hiVgK7xpNr";

// Support both Lovable and Vercel domains
const getRedirectUri = () => {
  const currentOrigin = window.location.origin;
  
  // If we're on localhost, use current origin
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return currentOrigin;
  }
  
  // Always use the current origin to support both domains
  return currentOrigin;
};

const redirectUri = getRedirectUri();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <HttpsEnforcer>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: redirectUri,
          audience: `https://${domain}/api/v2/`,
          scope: "openid profile email"
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    </HttpsEnforcer>
  </React.StrictMode>
);
