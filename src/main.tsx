
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

// Use Vercel domain for production, fallback to current origin for development
const getRedirectUri = () => {
  // If we're in development (localhost), use the current origin
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return window.location.origin;
  }
  // For production, use the Vercel domain
  return 'https://xentrik-marketing.vercel.app';
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
