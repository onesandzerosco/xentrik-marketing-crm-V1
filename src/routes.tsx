// If you don't have a routes.tsx file, we'll update App.tsx instead
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreatorFiles from './pages/creator-files/CreatorFiles';
import SharedFiles from './pages/SharedFiles';
import { RequireAuth } from './components/auth/RequireAuth';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import AccountSettings from './pages/AccountSettings';
import FileUploadPage from './pages/FileUploadPage';
import { FileProvider } from './context/file';
import { CreatorProvider } from './context/creator';
import { SearchPage } from './pages/SearchPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './hooks/useAuth';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/shared-files" element={<SharedFiles />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/creator-files/:id" element={<CreatorFiles />} />
      <Route path="/account" element={
        <RequireAuth>
          <AccountSettings />
        </RequireAuth>
      } />
      <Route path="/admin" element={
        <RequireAuth requiredRole="admin">
          <AdminDashboard />
        </RequireAuth>
      } />
    </Routes>
  );
};

export default AppRoutes;
