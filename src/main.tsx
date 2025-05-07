
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseAuthProvider } from './context/SupabaseAuthContext';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';
import './index.css';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SupabaseAuthProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SupabaseAuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
