
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreatorFiles from './pages/creator-files/CreatorFiles';
import SharedFiles from './pages/SharedFiles';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HttpsEnforcer from './components/auth/HttpsEnforcer';

const AppRoutes: React.FC = () => {
  return (
    <HttpsEnforcer>
      <Routes>
        <Route path="/creator-files/:id" element={<CreatorFiles />} />
        <Route path="/shared-files" element={<SharedFiles />} />
        <Route path="*" element={<SharedFiles />} />
      </Routes>
    </HttpsEnforcer>
  );
};

export default AppRoutes;
