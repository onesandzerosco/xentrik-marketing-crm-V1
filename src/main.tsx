
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import HttpsEnforcer from './components/auth/HttpsEnforcer';
import './index.css';
import './App.css';

// Auth0 configuration - you'll need to replace these with your own values from Auth0 dashboard
const domain = "YOUR_AUTH0_DOMAIN"; // Replace with your Auth0 domain
const clientId = "YOUR_AUTH0_CLIENT_ID"; // Replace with your Auth0 client ID
const redirectUri = window.location.origin;

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
