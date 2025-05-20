import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreatorFiles from './pages/creator-files/CreatorFiles';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/creator-files/:id" element={<CreatorFiles />} />
    </Routes>
  );
};

export default AppRoutes;
